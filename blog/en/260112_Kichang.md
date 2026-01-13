## Making AI "Understand" Construction: Introducing RAGO-CONSTRUCT

I am proud to introduce my independent research recently published in **Automation in Construction (2026)**: **"Retrieval optimization for construction documents in low-resource languages using contrastive sentence generation and matryoshka representation learning"**.

Construction engineering relies heavily on massive technical documents. However, general AI models often struggle to understand the specific terminology of the Korean construction industry. This often leads to **"hallucinations"**—where the AI gives confident but incorrect or misleading answers. To solve this, I developed **RAGO-CONSTRUCT**, a system designed to help AI find the right information and provide accurate answers to engineers.

---

## The Big Picture: Our Research Framework

To understand how we improved AI's "brain," let’s look at the overall framework of this research.

<img src="img/blog/260112_Kichang/FrameWork_ver2.png" alt="RAGO-CONSTRUCT Framework" class="img-medium">

> **This process involves three main phases:**
> * **Dataset Generation**: We collect official construction documents and use a local LLM to turn them into a specialized "study guide".
> * **Fine-Tuning**: We put our embedding model (the part of the AI that reads and searches) through a "boot camp" using this guide.
> * **RAG (The Final Exam)**: This is the real-world application where an engineer asks a question, and the AI retrieves the exact document to provide a factual answer.

---

## Step 1: Automatic Study Guides (CSG)

In specialized fields like construction, a single word can have many meanings. To help the AI learn these nuances, I proposed **Contrastive Sentence Generation (CSG)**.

<img src="img/blog/260112_Kichang/Traning, Test dataset gen_ver2.png" alt="Dataset Generation Process" class="img-medium">

Instead of spending thousands of dollars for experts to manually write training questions, we used a local AI to automatically generate them from official standards:
* **Entailment (Positive)**: A sentence that means the same thing as the original but uses different words.
* **Contradiction (Negative)**: A sentence that looks similar but contains a factual error.
* **Neutral**: A sentence that is related but doesn't confirm or deny the original fact.

We named this unique dataset **KorConNLI**. By studying these pairs, the AI learns to distinguish between what is technically correct and what is factually wrong.

---

## Step 2: The "Nesting Doll" Strategy (SBE)

Searching through long documents is hard for AI because specific details often get lost. To fix this, I introduced **Sentence Block Embedding (SBE)**, which works like a **Matryoshka (Russian Nesting Doll)**.

<img src="img/blog/260112_Kichang/Matryoshka Retrieval.png" alt="Matryoshka Retrieval Process" class="img-medium">

**Here is how it works:**
1.  **Chop it up**: We split a long text chunk into four smaller blocks (128 tokens each).
2.  **Compress**: Using **Matryoshka Representation Learning (MRL)**, we organize the most important information into the very beginning of the data vector.
3.  **Concatenate**: We take the "best bits" from each block and stitch them together into one efficient vector.
4.  **Pinpoint Search**: This allows the AI to search with the precision of short sentences while still providing the full context of the page to the AI for the final answer.

---

## Experimental Results: Outperforming Global Standards

Does this actually work better than standard AI? **Yes.** I tested RAGO-CONSTRUCT against some of the most powerful AI models available today.

* **Higher Accuracy**: RAGO-CONSTRUCT achieved **53.7%** retrieval accuracy, outperforming **OpenAI’s text-embedding-3-large (41.4%)** by 12.3 percentage points.
* **Better Reasoning**: Compared to traditional keyword searches (BM25), our system more than doubled the success rate.
* **Reliable Answers**: On end-to-end tests, our method improved the overall quality of the AI's answers from 6.9% to **53.5%**.

---

## Conclusion

This research provides a practical, low-cost way for the construction industry to adopt AI without needing massive computing power or manual data labeling. By using **CSG** and **SBE**, we ensure that when an engineer asks a question, the AI finds the right regulation and gives a safe, accurate answer.

---

## About the Author

<div class="author-card">
    <img src="img/member/student/최기창.jpg" alt="Kichang Choi" class="author-photo">
    <div class="author-info">
        <h4>Kichang Choi</h4>
        <p class="author-affiliation">Dept. of Civil and Environmental Engineering, Yonsei University</p>
        <p class="author-bio">
            I research natural language processing (NLP) and information retrieval systems specifically tailored for the construction industry. My work focuses on overcoming the limitations of general-purpose AI models in technical domains and low-resource languages. Through RAGO-CONSTRUCT, I am dedicated to making complex engineering knowledge more accessible and reliable for professionals in the field.
        </p>
        <div class="author-contact">
            <a href="mailto:amki1027@yonsei.ac.kr"><i class="fas fa-envelope"></i> amki1027@yonsei.ac.kr</a>
            <a href="https://github.com/Choikichang" target="_blank"><i class="fab fa-github"></i> github.com/Choikichang</a>
            <a href="https://choikichang.github.io/projects/" target="_blank"><i class="fas fa-external-link-alt"></i> Choikichang Webpage</a>
        </div>
    </div>
</div>