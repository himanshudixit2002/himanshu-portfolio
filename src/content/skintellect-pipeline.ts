/** Skintellect's pipeline as built in the repository's app.py, in order. */
export const SKIN_STEPS = [
  { title: "Photo", body: "Uploaded and prepared with OpenCV" },
  { title: "Detect", body: "YOLOv8 finds regions of concern (hosted on Roboflow)" },
  { title: "Classify", body: "An EfficientNetV2-based Keras model names the condition" },
  { title: "Match", body: "Conditions map to products in a skincare catalogue" },
  { title: "Explain", body: "Gemini writes advice in under 50 words" },
] as const;
