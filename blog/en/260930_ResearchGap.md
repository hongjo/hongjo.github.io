**Research and Academic Writing for Graduate Students · Part 2**

## Is a shortage of papers a research gap?

When I ask students to explain why their study is needed, I often hear:

> “Very few papers have applied this model to construction documents.”

That is a useful starting point for investigation. It is not yet a justification for research. The issue may have been studied under another name, an answer from another field may already apply, or the question may have little practical or scientific importance.

Finding a research gap means identifying **a question that existing knowledge cannot adequately answer and a reason why answering it matters**.

The construction-document AI and crack-segmentation scenarios in this article are hypothetical. Establishing that these gaps actually exist would require a separate literature review.

## Knowledge gaps, research gaps, and limitations

There is no single official classification used identically across all disciplines. These expressions overlap. For planning a study, the following distinctions are useful working definitions.

| Term | Meaning used here | Question to ask |
| --- | --- | --- |
| Knowledge gap | Insufficient knowledge or understanding within the research community | What do we not yet understand adequately? |
| Research gap | An unresolved problem or insufficient evidence that merits further investigation | Which question does existing research fail to answer adequately? |
| Limitations of previous studies | Constraints arising from a study’s design, data, measurement, or analysis | How far can its findings be interpreted or applied? |

A knowledge gap is different from **something I personally do not know**. An unfamiliar topic may already be well understood by the research community.

One paper’s limitation is also not automatically a gap in the field. A study conducted at one site may have been followed by convincing evidence from many sites. Conversely, a constraint shared across multiple studies may reveal an unresolved question.

“The model is slow” is not yet a complete research gap either. Specify when speed matters and which performance and resource requirements need to be satisfied together.

## Why is the evidence insufficient?

Robinson, Saldanha, and McKoy (2011) developed a framework for identifying gaps in healthcare systematic reviews. It distinguishes insufficient or imprecise information, biased information, inconsistent findings or unknown consistency, and information that does not address the question.[1]

This is not a universal rule that there are exactly four kinds of research gap. It can help engineering researchers specify **which evidence is missing for which question**. Imprecision concerns uncertainty in an estimate; it is distinct from systematic error or bias.

When reading papers, record more than titles and performance rankings:

- Which question was answered?
- Which data, subjects, and conditions were examined?
- What was measured, and what was left unmeasured?
- How far do the results support the stated conclusion?
- Can differences between studies be attributed to methods, or might their conditions explain them?

## Example 1: RAG for construction documents

Suppose you start with an implementation idea: apply retrieval-augmented generation, or RAG, to specifications. Reading and preliminary experiments suggest that questions requiring several clauses may be difficult.

Before claiming that previous research has failed to solve complex reasoning, separate the possibilities:

1. Did retrieval fail to provide the necessary clauses?
2. Does the model still struggle to combine conditions and exceptions when all necessary clauses are supplied?
3. Does explicitly representing relationships between clauses help when the underlying information is held constant?

For the second question, an *oracle evidence* condition can supply the required evidence directly. This tests something different from an end-to-end system that must also retrieve its evidence. For the third, compare representations using the same model, questions, and substantive information.

A candidate gap is now more precise than “No one has applied model X to construction”:

> Is there sufficient evidence to distinguish missing retrieved information from the effects of information representation on multi-clause questions?

Before presenting this as an established gap, check whether relevant studies already make that distinction. Until then, it is a **question for investigation**.

## Example 2: Is higher segmentation IoU enough?

Suppose a crack-segmentation model achieves a higher intersection-over-union score, or IoU. If the intended use is measuring crack length or identifying connectivity, does better pixel overlap establish that those tasks also improve?

The question becomes:

> How does pixel-level segmentation performance relate to the accuracy of crack-length and connectivity measurements?

Answering this may not require a new model. It may require consistent comparisons of existing models and suitable measurements of length or connectivity errors. Check whether previous studies have examined this relationship, and which crack widths, image resolutions, and capture conditions they covered.

A gap may concern a missing algorithm, but it may also concern **evidence about evaluation or the conditions of application**.

## Lessons from papers and the history of scholarship

**Swales’s CARS model** describes how research introductions establish a territory, create a niche, and introduce the present research. In the 1990 model, indicating a gap is one way to establish a niche, alongside counterclaiming, raising questions, and continuing a tradition.[2] Learning the sentence pattern “Previous studies are limited” does not establish that the research is needed.

**Alvesson and Sandberg (2011)** discuss *problematization*: questioning assumptions within existing literature, in the context of theory development in organization and management research.[3] This does not require every paper to overturn accepted assumptions. It invites researchers to examine how the problem itself has been framed.

**ResNet** illustrates a concrete motivating problem. He and colleagues investigated degradation in which deeper plain networks showed higher training error, and studied residual learning as a response.[4] The arXiv preprint appeared in 2015; the CVPR paper was published in 2016. The lesson is to identify the difficulty and the proposed response, not to assume that every performance improvement fully establishes its mechanism.

**Kuhn’s *The Structure of Scientific Revolutions*** first appeared in 1962. Its distinction between normal-science puzzle solving and scientific revolutions offers perspective: every paper need not produce a paradigm shift.[5] Refining knowledge and examining where established findings apply also have a place in research.

## Five steps for finding a gap

1. **Narrow the question.** Specify the subject, situation, and outcome.
2. **Compare the evidence.** Record data, assumptions, measures, and evaluation conditions alongside conclusions.
3. **Identify remaining uncertainty.** Look for missing evidence, bias, conflicting findings, or a mismatch between evidence and question.
4. **Check whether it has already been resolved.** Examine follow-up studies, alternative terminology, and neighboring fields.
5. **Connect importance to a feasible test.** Explain what the answer would change and how a study could establish it.

Record search terms, databases, search dates, and inclusion decisions so you can revisit your reasoning. These notes alone do not make the work a systematic review; describe the actual scope of your review accurately.

Before your next meeting, try writing four sentences:

> We currently know ___. However, evidence about ___ remains insufficient. This matters because ___. Therefore, this study will investigate ___.

Check the evidence behind the second sentence and the significance explained by the third. This turns gap identification into a question about knowledge and evidence, rather than a count of papers.

## References and reading notes

1. Robinson, K. A., Saldanha, I. J., & McKoy, N. A. (2011). Development of a framework to identify research gaps from systematic reviews. *Journal of Clinical Epidemiology, 64*(12), 1325–1330. [DOI](https://doi.org/10.1016/j.jclinepi.2011.06.009)
2. Swales, J. M. (1990). *Genre Analysis: English in Academic and Research Settings*. Cambridge University Press. [Publisher](https://shop.cambridge.org/english/product/2700033225)
3. Alvesson, M., & Sandberg, J. (2011). Generating research questions through problematization. *Academy of Management Review, 36*(2), 247–271. [DOI](https://doi.org/10.5465/amr.2009.0188)
4. He, K., Zhang, X., Ren, S., & Sun, J. (2016). Deep residual learning for image recognition. *Proceedings of CVPR*, 770–778. [DOI](https://doi.org/10.1109/CVPR.2016.90) · [2015 preprint](https://arxiv.org/abs/1512.03385)
5. Kuhn, T. S. (1962). *The Structure of Scientific Revolutions*. University of Chicago Press. [Publisher’s page for the 2012 fiftieth-anniversary edition](https://press.uchicago.edu/ucp/books/book/chicago/S/bo13179781.html)

These sources inform the concepts and approaches discussed here. They are not cited as direct evidence that the hypothetical construction-document or crack-segmentation gaps exist.

## A visual recap

[![Research gaps, limitations, five steps for identifying a gap, and hypothetical engineering examples](/img/blog/research-writing/02-en.webp)](/img/blog/research-writing/02-en.webp)

*Select the image to view it at full size.*

<!-- research-series-navigation -->

---

[이 글의 한국어 버전](/ko/blog/research-writing-02-finding-a-research-gap/)

**Research and Academic Writing for Graduate Students**

1. [What Is Research?](/blog/research-writing-01-what-is-research/)
2. [How to Find a Research Gap](/blog/research-writing-02-finding-a-research-gap/)
3. [How to Formulate Research Questions and Hypotheses](/blog/research-writing-03-questions-and-hypotheses/)
4. [How to Design Good Experiments](/blog/research-writing-04-experimental-design/)
