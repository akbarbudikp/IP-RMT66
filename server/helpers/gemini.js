import { GoogleGenAI } from "@google/genai";
import fs from "fs";

const ai = new GoogleGenAI(process.env.GOOGLE_API_KEY);

function fileToGenerativePart(path, mimeType) {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(path)).toString("base64"),
      mimeType,
    },
  };
}

async function VirtualTryOn(person_image, height, weight, product_size) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",

      contents: [
        {
            role: 'user',
            parts: [
                {
                    text: `
                        task:
                            name: virtual_try_on
                            description: "Apply a fashion product onto a person image with realistic fitting and an optional custom background."

                        inputs:
                            person_image: ${person_image}
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
                            style: "photorealistic"`
                }
            ]
        }
      ]
    });
  } catch (error) {
    console.log(error);
  }
}
