**Research and Academic Writing for Graduate Students · Part 1**

## What will you build—and what will you find out?

When discussing research topics with students who have just entered graduate school, I often hear ideas like these:

> “I would like to analyze construction documents using an LLM.”
>
> “I would like to apply a new model to crack segmentation.”

These are good starting points. But they are not quite research topics yet. They describe something to try, without identifying a question to investigate.

Suppose you build a system that uses an LLM to interpret construction specifications. You process PDFs, split documents into chunks, create embeddings, and set up a vector database and a retrieval-augmented generation (RAG) pipeline. In testing, the system answers 90% of the questions correctly.

Building it probably took considerable time and effort. It may also be useful in practice. But if you want to write a research paper, you need to ask one more question:

> **What did this research reveal that was not previously known?**

Simply applying existing RAG techniques to construction documents and showing that they work does not, by itself, establish an academic contribution.

Now suppose your analysis reveals something more specific. The LLM answers questions accurately when the answer lies within a single clause, but its error rate rises sharply when it must consider conditions scattered across several clauses.

That gives you a different starting point:

> “Why does this difference occur?”
>
> “How do the information structure of construction documents and the complexity of questions affect an LLM’s interpretation performance?”

If you formulate these questions and systematically vary question types and document structures in your experiments, you move beyond implementing a system to conducting research. You may identify the conditions under which the LLM fails and determine whether those failures originate in retrieval or reasoning.

## Does that mean improving performance is not research?

No. Engineering has many excellent papers that improve the performance of existing methods.

Consider crack segmentation. Suppose an existing encoder–decoder model struggles to segment very thin cracks. Your analysis suggests that losing thin-crack features during downsampling is an important cause. You propose a new method that preserves high-resolution features, then use multiple datasets and an ablation study to demonstrate improved thin-crack segmentation.

This can certainly be good research.

By contrast, it is a different matter if the paper ends at:

> “Adding an attention module to U-Net improved IoU by 2%.”

That statement does not clarify why the module is needed, which limitation of the existing method it addresses, or whether the proposed idea actually explains the improvement.

What matters is more than whether you built a new model or increased performance by a certain percentage. Good methodological research generally follows a sequence like this:

> Identify a problem → establish a limitation of existing methods → propose an idea to address it → implement the idea as a method → validate it experimentally → make a contribution beyond existing research.

A contribution need not take only one form. It may be a new method, a previously unknown phenomenon or relationship, or a new dataset or benchmark. Applying existing technologies to an important practical problem can also produce a new, generalizable methodology.

## What to consider before choosing a model

There is one point I particularly want students to remember. Try not to begin with “What should I build?” Instead, first consider:

- What remains poorly solved?
- What is still not well understood?
- What are the limitations of existing research?

Then decide whether solving that problem requires building a model, conducting experiments, or creating a dataset.

In its simplest form, the research process looks like this:

> Problem → Existing Knowledge → Research Gap → Research Question → Method → Evidence → Contribution

## Four questions before your next research meeting

If you are starting your first research project, try answering these four questions before preparing your next meeting materials:

1. What exactly is the problem I want to solve?
2. Why is existing research insufficient?
3. What new idea will I propose, or what new knowledge will I seek?
4. What evidence will I use to demonstrate it?

Working through these questions is where research begins.

## A visual recap

[![English-language infographic comparing research with implementation work, including research questions, methods, evidence, and contributions](/img/blog/260923_ResearchGuide/research-vs-work-en.webp)](/img/blog/260923_ResearchGuide/research-vs-work-en.webp)

*Select the image to view it at full size.*
