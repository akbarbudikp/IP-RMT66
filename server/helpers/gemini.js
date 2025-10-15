const { GoogleGenAI } = require("@google/genai") 
const fs = require("fs");
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY});

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
                            value: "A clean, minimalist studio with bright natural light" 

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

        for (const part of response.candidates[0].content.parts) {
            if (part.text) {
                console.log(part.text);
            } else if (part.inlineData) {
                const imageData = part.inlineData.data;
                const buffer = Buffer.from(imageData, "base64");
                fs.writeFileSync("gemini-native-image.png", buffer);
                console.log("Image saved as gemini-native-image.png");
            }
        }
    } catch (error) {
        console.log(error);
    }
}

module.exports = {VirtualTryOn}