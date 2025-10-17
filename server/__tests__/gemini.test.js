const fs = require('fs');
const path = require('path');
const mockGenerateContent = jest.fn();
const mockWriteFileSync = jest.fn();
const mockUnlinkSync = jest.fn();
let virtualTryOn;
let cloudinary;

describe('virtualTryOn Helper', () => {
    beforeEach(() => {
        jest.resetModules();

        jest.doMock('@google/genai', () => ({
            GoogleGenAI: jest.fn(() => ({
                models: { generateContent: mockGenerateContent },
            })),
        }));

        jest.doMock('cloudinary', () => ({
            v2: {
                config: jest.fn(),
                uploader: { upload: jest.fn() },
            },
        }));

        jest.doMock('fs', () => ({
            ...jest.requireActual('fs'),
            writeFileSync: mockWriteFileSync,
            unlinkSync: mockUnlinkSync,
        }));

        global.fetch = jest.fn(() =>
            Promise.resolve({
                arrayBuffer: () => Promise.resolve(Buffer.from('fake image data')),
            })
        );

        cloudinary = require('cloudinary');
        virtualTryOn = require('../helpers/gemini').virtualTryOn;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return a Cloudinary URL on successful generation', async () => {
        const mockAiResponse = {
            candidates: [{
                content: {
                    parts: [{ inlineData: { data: 'base64imagedata' } }],
                },
            }],
        };
        mockGenerateContent.mockResolvedValue(mockAiResponse);
        cloudinary.v2.uploader.upload.mockResolvedValue({ secure_url: 'http://cloudinary.com/final-result.jpg' });

        const result = await virtualTryOn(
            'http://example.com/person.jpg',
            'http://example.com/product.jpg',
            170, 70, 'M'
        );

        expect(result).toBe('http://cloudinary.com/final-result.jpg');
        expect(mockWriteFileSync).toHaveBeenCalled();
        expect(mockUnlinkSync).toHaveBeenCalled();
    });

    it('should throw an error if AI does not return an image', async () => {
        const mockAiResponse = {
            candidates: [{ content: { parts: [{ text: 'some text' }] } }],
        };
        mockGenerateContent.mockResolvedValue(mockAiResponse);

        await expect(virtualTryOn(
            'http://example.com/person.jpg',
            'http://example.com/product.jpg',
            170, 70, 'M'
        )).rejects.toThrow('AI did not return a valid image.');
    });

    it('should re-throw an error if the AI call fails', async () => {
        const aiError = new Error('Gemini API is down');
        mockGenerateContent.mockRejectedValue(aiError);

        await expect(virtualTryOn(
            'http://example.com/person.jpg',
            'http://example.com/product.jpg',
            170, 70, 'M'
        )).rejects.toThrow('Gemini API is down');
    });
});