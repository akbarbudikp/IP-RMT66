const { GoogleGenAI } = require("@google/genai")
const fs = require("fs");
const path = require('path');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function fileToGenerativePart(url) {

    const pdfResp = await fetch(url)
        .then((response) => response.arrayBuffer());

    return {
        data: Buffer.from(pdfResp).toString("base64"),
        mimeType: "image/jpeg"
    };
}

async function VirtualTryOn(person_image, product_image, height, weight, product_size) {
    try {
        const config = {
            responseModalities: [
                'IMAGE',
                'TEXT',
            ],
            imageConfig: {
                aspectRatio: '3:4',
            },
        };

        const prompt = `
                        task:
                            name: virtual_try_on
                            description: "Apply a fashion product onto a person image with realistic fitting and an optional custom background."

                        inputs:
                            description: "Full body image of a real person. This is the base image."
  
                        product_image:
                            description: "Image of the fashion product to be worn."

                        parameters:
                            product_size: ${product_size}
                            person_details:
                                height: ${height}
                                weight: ${weight}
  
                        background:
                            value: "A clean, minimalist studio with white bright natural light" 

                        output:
                            prompt: >
                                Photorealistic virtual try-on.
                                Using the 'person_image' as the base, apply the garment from the 'product_image' onto the person.
                                Preserve the person's identity, face, and pose.
                                Replace the original background with the new background specified in 'parameters.background'.
                                The garment should be rendered with realistic lighting, shadows, wrinkles, and draping that conforms to the person's body.
                                Fit the garment according to the 'product_size'.
                                Adjust the person's physique to realistically represent the specified 'height' and 'weight' in 'person_details'.
                                Ensure the person is seamlessly integrated into the new background with matching lighting and perspective.
  
                        negative_prompt: >
                            cartoon, illustration, distorted body parts, unrealistic textures, mismatched lighting, blurry, watermark, text, extra limbs, floating person, background mismatch.
  
                        specs:
                            resolution: "high"
                            style: "photorealistic"
                        `

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-image",
            config: config,
            contents: [
                {
                    text: prompt
                },
                {
                    inlineData: await fileToGenerativePart(product_image)
                },
                {
                    inlineData: await fileToGenerativePart(person_image)
                }
            ]
        });

        const imagePart = response.candidates[0].content.parts.find(part => part.inlineData);

        if (!imagePart) {
            throw new Error("AI did not return a valid image.");
        }

        const imageData = imagePart.inlineData.data;
        const buffer = Buffer.from(imageData, "base64");
        
        const tempFilePath = path.join(__dirname, `temp_gemini_image_${Date.now()}.png`);
        fs.writeFileSync(tempFilePath, buffer);

        const uploadResult = await cloudinary.uploader.upload(tempFilePath, {
            folder: "virtual-try-on-results"
        });

        fs.unlinkSync(tempFilePath);
        
        const finalResultUrl = uploadResult.secure_url;
        return finalResultUrl;
    } catch (error) {
        console.log(error);
        throw error
    }
}

module.exports = { VirtualTryOn }