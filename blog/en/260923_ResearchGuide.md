**Research and Academic Writing for Graduate Students · Part 1**

*Updated 2026-09-30: clarified hypothetical examples and numerical reporting, and revised the discussion and infographic on questions, contributions, and causal interpretation.*

## What will you build—and what will you find out?

When discussing research topics with students who have just entered graduate school, I often hear ideas like these:

> “I would like to analyze construction documents using an LLM.”
>
> “I would like to apply a new model to crack segmentation.”

These are good starting points. But they are not quite research topics yet. They describe something to try, without identifying a question to investigate.

*The numerical results and research scenarios below are hypothetical examples used to explain the structure of research.*

Suppose you build a system that uses an LLM to interpret construction specifications. You process PDFs, split documents into chunks, create embeddings, and set up a vector database and a retrieval-augmented generation (RAG) pipeline. In testing, the system answers 90% of the questions correctly.

Building it probably took considerable time and effort. It may also be useful in practice. But if you want to write a research paper, you need to ask one more question:

> **What did this research reveal that was not previously known?**

Simply applying existing RAG techniques to construction documents and showing that they work does not, by itself, establish an academic contribution.

Now suppose your analysis reveals something more specific. The LLM answers questions accurately when the answer lies within a single clause, but its error rate rises sharply when it must consider conditions scattered across several clauses.

That gives you a different starting point:

> “Why does this difference occur?”
>
> “How do the information structure of construction documents and the complexity of questions affect an LLM’s interpretation performance?”

If you formulate these questions and systematically vary question types and document structures in your experiments, you move beyond implementing a system to conducting research. You can identify conditions associated with more errors and use experiments that directly provide the necessary evidence to examine the roles of retrieval and answer generation. Differences between question types alone do not establish the cause.

A research question does not have to ask “why.” Describing or measuring a phenomenon, predicting new cases, and comparing which method works better under specified conditions can also guide research.

## Does that mean improving performance is not research?

No. Engineering has many excellent papers that improve the performance of existing methods.

Consider crack segmentation. Suppose an existing encoder–decoder model struggles to segment very thin cracks. Your analysis leads to a hypothesis: losing thin-crack features during downsampling may be one contributing cause. You propose a method that preserves high-resolution features, then use multiple datasets and an ablation study to demonstrate improved thin-crack segmentation. This supports the method’s effectiveness under the evaluated conditions. Supporting the proposed explanation also requires examining alternatives, such as increased model capacity.

This can certainly be good research.

By contrast, it is a different matter if the paper ends at:

> “Adding an attention module to U-Net increased IoU from 0.70 to 0.72, a gain of 2 percentage points.”

That statement does not clarify why the module is needed, which limitation of the existing method it addresses, or whether the proposed idea actually explains the improvement.

The change from 0.70 to 0.72 is an IoU difference of 0.02, or **2 percentage points** when expressed as 70% to 72%. The relative increase is approximately 2.86%. Specify which quantity you mean.

What matters is more than whether you built a new model or increased a performance score. Good methodological research often has a logical structure like this:

> Identify a problem → establish a limitation of existing methods → propose an idea to address it → implement the idea as a method → validate it experimentally → make a contribution beyond existing research.

A contribution need not take only one form. It may be a new method, a previously unknown phenomenon or relationship, or a new dataset or benchmark. Applying existing technologies to an important practical problem can yield a new methodology or evidence about the conditions of application. Rigorous studies of reproducibility and the scope of existing findings can contribute as well.

## Developing an implementation idea into a research question

There is one point I particularly want students to remember. “What should I build?” can be a starting point. Develop that implementation idea into a research question, including by asking the following as you work:

- What remains poorly solved?
- What is still not well understood?
- What are the limitations of existing research?

Use these questions to guide model development, experiments, or data collection, and refine the questions as you learn.

One way to organize the logic of a study is:

> Problem → Existing Knowledge → Research Gap → Research Question → Method → Evidence → Contribution

This is not a mandatory chronological sequence. Actual research moves between exploration, implementation, reading, and experiments as questions and methods evolve.

## Four questions before your next research meeting

If you are starting your first research project, try answering these four questions before preparing your next meeting materials:

1. What exactly is the problem I want to solve?
2. Why is existing research insufficient?
3. What new idea will I propose, or what new knowledge will I seek?
4. What evidence will I use to demonstrate it?

Working through these questions is where research begins.

## A visual recap

[![Different forms of research questions, evidence, performance improvement, and the scope of contributions](/img/blog/research-writing/01-en.webp)](/img/blog/research-writing/01-en.webp)

*Select the image to view it at full size.*

<!-- research-series-navigation -->

---

[이 글의 한국어 버전](/ko/blog/research-writing-01-what-is-research/)

**Research and Academic Writing for Graduate Students**

1. [What Is Research?](/blog/research-writing-01-what-is-research/)
2. [How to Find a Research Gap](/blog/research-writing-02-finding-a-research-gap/)
3. [How to Formulate Research Questions and Hypotheses](/blog/research-writing-03-questions-and-hypotheses/)
4. [How to Design Good Experiments](/blog/research-writing-04-experimental-design/)
