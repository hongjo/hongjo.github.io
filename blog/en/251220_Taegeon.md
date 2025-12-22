<img src="img/blog/251220_Taegeon/title.png" alt="Overview of the proposed LVLM-based construction safety assessment framework" class="img-medium">
This article reviews the paper "Optimizing large vision-language models for context-aware construction safety assessment," published in Automation in Construction (Elsevier) in 2025, focusing on how the research addresses the limitations of existing AI-based safety monitoring systems through the application of generative AI and Large Vision-Language Models (LVLMs).

This study is notable for its approach to construction site safety assessment that goes beyond simple object detection to enable context-aware reasoning. While conventional computer vision models have been widely adopted for construction safety monitoring, they are typically constrained to detecting objects within predefined classes. This limitation makes it difficult to assess complex hazardous situations that require understanding spatial relationships and contextual information.

In the construction industry, AI-based safety monitoring systems have been primarily used for tasks such as detecting Personal Protective Equipment (PPE) violations, monitoring worker-equipment proximity, and identifying restricted zone intrusions. However, real-world construction hazards often involve complex multi-step recognition processes that cannot be adequately addressed by simple object detection alone.

This article reviews research that leverages Large Vision-Language Models to perform context-aware safety assessments, examining how the proposed approach differs from existing methods and what practical limitations it addresses in construction safety monitoring.

---

## Limitations of Existing Construction Safety Monitoring Systems

Deep learning-based safety monitoring systems have made significant progress in construction site management. However, these systems face several fundamental limitations when deployed in real-world construction environments.

First, most computer vision models are constrained to detecting objects within predefined classes. For example, a common safety rule specifies that construction materials carried by a forklift must remain below the driver's line of sight. To enforce this rule, a model must not only detect the forklift and materials but also compare the material height to the driver's line of sight. This multi-step recognition process is beyond the capability of conventional object detection models.

Second, developing monitoring systems capable of executing such detailed recognition across various hazardous situations requires significant time and effort. Creating accurate models requires collecting, labeling, and preprocessing vast amounts of high-quality training data encompassing diverse objects and situations encountered on construction sites.

Third, addressing the variability and unpredictability of construction site conditions, including changes in lighting, weather, and object occlusion, necessitates rigorous testing and optimization to ensure robust performance.

---

## Large Vision-Language Models and Their Potential

Large Vision-Language Models (LVLMs) represent a promising solution to these challenges. Models such as CLIP, BLIP, PaLI, and LLaVA are pre-trained on extensive image-text pairs and excel in vision-language tasks like image captioning and visual question answering (VQA).

LVLMs offer significant potential for construction safety monitoring due to their ability to recognize a broad range of objects in images and understand contextual relationships. Unlike conventional computer vision models that output only classification results, LVLMs can interpret and explain situations in natural language, making them particularly suitable for safety assessment tasks that require reasoning about complex scenarios.

However, general-purpose LVLMs trained on datasets like COCO Captions, CC12M, and LAION primarily consist of general situations and lack specific contextual details relevant to construction sites. To develop an effective LVLM-based construction safety monitoring system, the model must understand the unique contexts of construction environments, which are not adequately represented in general pre-trained datasets.

---

## Core Research Question

This paper starts from the following question:

> Can generative AI go beyond simply describing construction site images to contextually judge and explain the safety status of situations?

To address this, the researchers propose a framework that combines domain-specific image-text data generation, vision encoder fine-tuning for improved object recognition, and Low-Rank Adaptation (LoRA)-based model adjustment for context-aware safety reasoning. This approach is designed to enhance both visual understanding and context-aware reasoning in safety-critical scenarios.

---

## Method Overview

The proposed method consists of three main stages:

1. Generating construction safety domain-specific instruction-following data
2. Fine-tuning the vision encoder for improved recognition of construction-specific visual elements
3. LoRA fine-tuning the LVLM for context-aware safety assessment

This framework transforms a general-purpose LVLM into a specialized model capable of performing safety assessments with detailed explanations.

---

<!-- Figure 1 -->
<img src="img/blog/251220_Taegeon/Figure1.jpg" alt="Overview of the proposed LVLM-based construction safety assessment framework" class="img-medium">

---

## Step 1. Generating Instruction-Following Data

To train an LVLM for construction safety assessment, domain-specific image-text pair datasets are required. However, such datasets are extremely limited in practice. The source data for this research was obtained from "The Open AI Dataset Project" (AI-Hub, South Korea), which includes construction site images, polygon masks for construction objects, simple captions describing hazardous situations, and bounding boxes highlighting hazardous areas.

The researchers designed specific prompts to instruct GPT-4V to generate outputs tailored to two specific tasks:

- Detailed descriptions of hazardous situations: The model is prompted to conduct thorough analysis, identifying and describing key elements such as scaffolding, machinery, workers, and safety equipment. The output goes beyond simple object recognition to deliver comprehensive, safety-oriented explanations.

- Complex reasoning tasks addressing safety issues: The model generates safety-related questions based on the provided image and bounding boxes, then provides well-reasoned answers based on its analysis of the scene. This trains the model to think critically about safety conditions.

By incorporating image inputs directly, GPT-4V captures detailed visual information, enriching its outputs with construction safety-specific context. Few-shot examples are included in the prompts to help generate accurate, safety-focused descriptions and reasoning.

<img src="img/blog/251220_Taegeon/Figure4.jpg" alt="Overview of the proposed LVLM-based construction safety assessment framework" class="img-medium">

---

## Step 2. Fine-tuning the Vision Encoder

The accuracy of safety assessment heavily depends on how precisely the model recognizes objects and their spatial arrangements in images. The vision encoder in LVLMs extracts high-level representations from images, but pre-trained encoders often struggle in specific domains due to differences in data distributions between source and target domains.

To address this limitation, the researchers fine-tune the CLIP ViT-L-336px vision encoder used in LLaVA 1.5 through a dual-input approach. Both full images and sub-regions (cropped by bounding boxes identifying hazardous situations) are fed into the image encoder. This ensures that the model learns both global context from whole images and local details from cropped sub-regions.

To prevent overfitting given the relatively small scale of the construction dataset, a selective fine-tuning strategy is employed. Among the 24 transformer layers in the CLIP model's vision encoder, only the higher layers (15-24) are fine-tuned, while the remaining lower layers (1-14) are frozen. Freezing the lower layers preserves the pre-trained model's ability to extract general visual features such as edges and textures, while fine-tuning the higher layers allows adaptation to construction-specific characteristics.

<img src="img/blog/251220_Taegeon/Figure5.jpg" alt="Overview of the proposed LVLM-based construction safety assessment framework" class="img-medium">

---

## Step 3. LoRA Fine-tuning for Safety Assessment

After refining the vision encoder, the model is further optimized using Low-Rank Adaptation (LoRA). LoRA introduces trainable low-rank matrices into the attention layers, enabling efficient parameter updates while significantly reducing the number of trainable parameters. This allows the model to adapt to the construction safety domain without full retraining.

The fine-tuning strategy selectively unfreezes layers 15-24 of the vision encoder along with the projection layer and the large language model. The projection layer converts the vision encoder's output into an embedding space compatible with the language model, ensuring that visual cues are effectively aligned with textual reasoning. The large language model then processes the integrated input to decode instructions and generate coherent, context-specific responses.

Through this approach, the model becomes capable of:
- Classifying situations as "Safe" or "Unsafe"
- Providing detailed textual rationales supporting the classification
- Identifying specific hazards and explaining why they pose safety risks

---

<!-- Figure 6 -->
<img src="img/blog/251220_Taegeon/Figure6.jpg" alt="Overview of the proposed LVLM-based construction safety assessment framework" class="img-medium">

---

## Experimental Results Summary

The model was evaluated on 400 images covering 10 hazardous situations commonly found on construction sites, including ladder safety, scaffolding work, mobile crane operations, signalman placement, fire extinguisher deployment, and forklift operations. Each situation contained both safe and unsafe cases.

For the image captioning task, the proposed model demonstrated superior performance:
- Average ROUGE-L: 0.3852 (vs. GPT-4V: 0.1898, LLaVA 1.5: 0.2183)
- Average SPICE: 0.3615 (vs. GPT-4V: 0.1740, LLaVA 1.5: 0.1364)
- Average SBERT-based similarity: 0.7484 (vs. GPT-4V: 0.6459, LLaVA 1.5: 0.5872)

For safety assessment, the fine-tuned model achieved 94.25% accuracy in predicting safety status, significantly outperforming GPT-4V (53.25%) and LLaVA 1.5 (48%). The quality of textual justifications was assessed using both GPT-4V-based and expert-based evaluations, where the fine-tuned model consistently received the highest relevance and preference scores.

A notable finding is that baseline models often misidentified safe situations as unsafe or failed to recognize critical safety elements. For example, when a signalman was present during dump truck operations, GPT-4V and LLaVA 1.5 sometimes incorrectly classified the situation as unsafe, failing to recognize the role of the signalman in ensuring safe operations.

---

<!-- Performance comparison graph -->
<img src="img/blog/251220_Taegeon/Figure11.jpg" alt="Overview of the proposed LVLM-based construction safety assessment framework" class="img-medium">

---

## Significance and Application Possibilities

The value of this research can be summarized as follows:

- Demonstrates the potential of LVLMs for context-aware construction safety assessment beyond simple object detection
- Addresses the knowledge gap in applying vision-language models to the construction domain
- Provides a framework for generating domain-specific training data to overcome data scarcity
- Offers a method that combines visual understanding with contextual reasoning for safety-critical applications

The proposed model can be integrated into visual inspection workflows, image-based safety documentation, and automated safety reporting systems. By providing safety status classification, contextual explanations, and suggested corrective actions, the model can assist safety managers in interpreting site conditions and making informed decisions.

---

## Limitations and Future Research Directions

The researchers acknowledge the following limitations:

- Object detection accuracy can affect safety assessment performance for some images
- All images were sourced from domestic locations within South Korea, and generalization to other regions requires validation
- The 10 hazard situations used do not cover all possible construction safety scenarios
- Reliance on image data may not fully capture the comprehensive context of construction sites

Future research should investigate generalization performance under diverse environmental conditions, expansion to more hazard situations, and integration of additional data modalities such as video and audio to better capture the comprehensive environment of construction sites.

---

## Conclusion

Construction site safety monitoring requires more than simple object detection. This research demonstrates that Large Vision-Language Models, when fine-tuned with domain-specific data and instructions, can perform context-aware hazard detection and interpretation.

The proposed framework successfully combines vision-language modeling with domain-specific fine-tuning for end-to-end construction safety assessment. By supporting both detection and reasoning within a unified model, this approach offers a comprehensive method for improving the interpretability and effectiveness of safety assessments in construction site monitoring.

---

## About the Author

<div class="author-card">
    <img src="img/member/student/김태건.jpg" alt="Taegeon Kim" class="author-photo">
    <div class="author-info">
        <h4>Taegeon Kim</h4>
        <p class="author-affiliation">Integrated MS/PhD Program, Dept. of Civil and Environmental Engineering, Yonsei University</p>
        <p class="author-bio">
            Researching construction AI and deep learning applications including CCTV-based object detection, domain adaptation, and automatic training data generation for construction sites. Interested in constraints of real-world site video data and data-centric learning methods to overcome them.<br><br>
            Currently serving as CEO of ONTOH, a construction AI startup. ONTOH is developing an AI CCTV solution that combines <strong>Physical AI</strong> technology for recognizing and interpreting hazardous situations in construction site CCTV footage with <strong>generative AI</strong> technology for creating safety documents and reports using site video and management data. Additionally, developing systems for proactive health and safety management at construction sites through <strong>health DB construction</strong> and site-level <strong>health monitoring</strong> for vulnerable workers such as elderly workers and those with underlying conditions.
        </p>
        <div class="author-contact">
            <a href="mailto:geon9655@gmail.com"><i class="fas fa-envelope"></i> geon9655@gmail.com</a>
            <a href="tel:+82-10-6737-6598"><i class="fas fa-phone"></i> +82-10-6737-6598</a>
            <a href="https://hongjo.github.io/" target="_blank"><i class="fas fa-globe"></i> hongjo.github.io</a>
        </div>
    </div>
</div>
