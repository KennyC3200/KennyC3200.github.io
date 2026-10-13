---
title: Transformer Model Explained, with Math and Code
description: The math behind the transformer model, from tokens and embeddings to queries, keys, and values, with each step written out in PyTorch alongside the equations.
date: 2026-06-20
tags: [Python, PyTorch, Linear Algebra]
cover: /images/blogs/transformer_model_math_explained/transformer_architecture.png
---

Generative Pre-trained Transformer, or GPT, is a type of neural network that is designed to understand and produce text. This type of neural network falls into the category of a large language model, or LLM. This post aims to explain the basic terminology and fundamentals for how the earliest large language models were developed and hopefully provide insight into the theory and architecture behind modern LLMs.

## The Basics

### What is a Token?

A token is the basic unit of text. This includes words, sub-words, punctuation, and even characters. Common words, like “the” or “that”, are typically a single token, while rare or long words are broken into sub-words. To process these tokens, models convert these tokens into **embeddings** via an **embedding table**.

Before anything is embedded, each token is given an integer index. Real tokenizers learn a sub-word vocabulary, but splitting the example sentence used throughout this post on spaces is enough to follow along:

```python
import torch

text = "The blue fluffy cat ate the tuna"
tokens = text.lower().split()
vocab = sorted(set(tokens))
stoi = {tok: i for i, tok in enumerate(vocab)}
ids = torch.tensor([stoi[t] for t in tokens])
# vocab: ['ate', 'blue', 'cat', 'fluffy', 'the', 'tuna']
# ids:   tensor([4, 1, 3, 2, 0, 4, 5])
```

### Embeddings

The backbone of all LLMs is an **embedding table**. An embedding table maps a discrete value to a vector of continuous numbers, and is mathematically represented as a matrix $W_E\in\mathbb{R}^{V\times d_\text{model}}$. In the context of LLMs, $V$ is the vocabulary size and $d_\text{model}$ is the embedding size. The vector of a mapped token is called an **embedding**. As an example, consider an embedding table $W_E\in\mathbb{R}^{5\times10}$. This means that the table maps $5$ tokens to embedding vectors of size $10$. One such embedding table may look like:

$$
W_E=
\begin{array}{c|ccccc}
    \text{the} & 0.2 & -0.1 & 0.7 & \cdots & 0.3 \\
    \text{that} & 0.8 & 0.4 & -0.2 & \cdots & 0.5 \\
    \vdots & \vdots & \vdots & \vdots & \ddots & \vdots \\
    \text{hello} & 0.1 & 0.2 & 0.8 & \cdots & 0.4
\end{array}
$$

In PyTorch, this table is an `nn.Embedding`, which starts out random and is learned during training:

```python
import torch.nn as nn

vocab_size, d_model = len(vocab), 10
W_E = nn.Embedding(vocab_size, d_model)
# W_E.weight: torch.Size([6, 10])
```

To retrieve the embedding of the token with index $i\in\{1,\dots, V\}$, we define a one-hot encoded vector $x_i\in\{0,1\}^V$ where $x_{i,i}=1$ and $0$ elsewhere, then the embedding vector is retrieved by multiplying the embedding matrix with $x_i$:

$$
e_i=W_E^Tx_i=W_E[i,:]\in\mathbb{R}^{d_\text{model}}
$$

Both sides of this equation can be checked directly. The multiplication only ever picks out one row, which is why `nn.Embedding` skips it and indexes the row instead:

```python
import torch.nn.functional as F

x = F.one_hot(torch.tensor(stoi["cat"]), vocab_size).float()
e = W_E.weight.T @ x
torch.allclose(e, W_E.weight[stoi["cat"]])  # True

E = W_E(ids)  # one row per token: torch.Size([7, 10])
```

## Attention

Attention is a mechanism that enables the model to determine the importance of different words depending on their positioning and gathered context when processing a specific token. Every model has a **context size**, and this size determines how much text the model can process and recall. We will denote the context size with $N$.

Attention consists of three core matrices:

1. Queries, $Q\in\mathbb{R}^{N\times d_k}$
2. Keys, $K\in\mathbb{R}^{N\times d_k}$
3. Values, $V\in\mathbb{R}^{N\times d_v}$

Where $d_k$ represents the projection dimension of the key/query matrices and $d_v$ is the projection dimension of the value matrix. In multi-head attention with $h$ heads, the projection dimension $d_k$ is typically calculated as the following to preserve computational complexity:

$$
d_k=\frac{d_\text{model}}{h}
$$

For the running example, with two heads:

```python
N = len(ids)       # 7 tokens in the context
h = 2
d_k = d_model // h # 5
d_v = d_k
```

### Queries

A query can be thought of as the current token searching for context from other words. For instance, in the sentence “The blue fluffy cat ate the tuna”, to generate the token “tuna”, the model queries previous tokens in the context window for necessary context (such as tokens “blue”, “fluffy”, “cat”, and “ate”). This query for token $i$ is **encoded as a vector**, $\mathbf{Q_i}\in\mathbb{R}^{d_k}$. To generate this query, the embedded vector for that token $\mathbf{E_i}\in\mathbb{R}^{d_\text{model}}$ is multiplied by a **weighted query matrix**, $W_Q\in\mathbb{R}^{d_\text{model}\times d_k}$. The query matrix starts with randomly generated values and its entries are parameters, meaning they will be fine-tuned during training:

$$
\mathbf{Q_i}=\mathbf{E_i}W_Q
$$

A learned matrix with no bias is an `nn.Linear(..., bias=False)`. It stores its weight transposed, as $W_Q^T$, so the query for “cat”, the fourth token, is:

```python
W_Q = nn.Linear(d_model, d_k, bias=False)
q_cat = E[3] @ W_Q.weight.T  # torch.Size([5])
```

Computing the queries for every token $i\in[1,N]$ in the context window can be simplified down to one matrix multiplication:

$$
Q=EW_Q
$$

Where $E\in\mathbb{R}^{N\times d_\text{model}}$, yielding $Q\in\mathbb{R}^{N\times d_k}$.

```python
Q = W_Q(E)                  # torch.Size([7, 5])
torch.allclose(Q[3], q_cat) # True
```

### Keys

A key is an answer to a query from another token. For instance, if the token **before** “tuna” were to query for context, certain tokens that are relevant to generating that token, such as “fluffy”, “cat”, and “ate”, can provide the context necessary to complete the sentence. These tokens communicate this information through **keys**. Similar to queries, the keys matrix is determined by multiplying the embedded matrix with a **weighted keys matrix**, $W_K\in\mathbb{R}^{d_\text{model}\times d_k}$. The keys for all tokens in a context window are calculated through matrix multiplication:

$$
K=EW_K
$$

Yielding $K\in\mathbb{R}^{N\times d_k}$.

```python
W_K = nn.Linear(d_model, d_k, bias=False)
K = W_K(E)  # torch.Size([7, 5])
```

### Interpreting Queries and Keys

Currently, the queries and keys are real values in a matrix. To make them useful, we can consider the matrix product between the two matrices $QK^T\in\mathbb{R}^{N\times N}$. This is significant because if the two row vectors in $Q$ and $K$ (before transposing $K$) are closely aligned, their dot product (calculated in the matrix multiplication) will be a large value, while if the two vectors are not aligned their dot product will be a small or negative value.

```python
scores = Q @ K.T  # scores[i, j] = Q_i · K_j, torch.Size([7, 7])
```

The next step is to apply softmax to each row to make the data interpretable. However, there is a problem: this matrix product currently calculates every single key-query dot product, even those where the key belongs to a later token, such as having a key “tuna” for the query “fluffy”. This is nonsense because “fluffy” comes before “tuna”, meaning the model would have to grab generated tokens from the future. To resolve this, since the next step is the softmax function, mask the matrix to be lower triangular, where the masked elements become $-\infty$, since $e^{-\infty}=0$ and those elements receive no weight after softmax. The mask has to come before the softmax: zeroing elements afterwards would leave rows that no longer sum to $1$.

To illustrate this, suppose the matrix $QK^T$ is

$$
QK^T=
\begin{bmatrix}
    96.1 & -10.1 & \dots & 1.23 \\
    -142.1 & 21.9 & \dots & 0.01 \\
    \vdots & \vdots & \ddots & \vdots \\
    -0.11 & -1.2 & \dots & 0.21
\end{bmatrix}_{N\times N}
$$

Apply masking:

$$
\begin{bmatrix}
    96.1 & -\infty & \dots & -\infty \\
    -142.1 & 21.9 & \dots & -\infty \\
    \vdots & \vdots & \ddots & \vdots \\
    -0.11 & -1.2 & \dots & 0.21
\end{bmatrix}_{N\times N}
$$

The lower-triangular mask is `torch.tril`, and everything above the diagonal is filled with $-\infty$:

```python
mask = torch.tril(torch.ones(N, N, dtype=torch.bool))
scores = scores.masked_fill(~mask, float("-inf"))
```

Finally, applying the softmax function to each row yields

$$
\begin{bmatrix}
    1.00 & 0.00 & \dots & 0.00 \\
    0.00 & 1.00 & \dots & 0.00 \\
    \vdots & \vdots & \ddots & \vdots \\
    0.37 & 0.12 & \dots & 0.51
\end{bmatrix}_{N\times N}
$$

This example illustrates another problem: when the scores in a row are far apart, softmax gives almost all of the weight to the largest one, as in the first two rows above, where the outputs are exactly $1.00$ and $0.00$. This is called **saturation**, and it makes the gradients vanish, so the model stops learning from those scores. The scores grow with $d_k$: if the entries of a query and a key have variance $1$, their dot product has variance $d_k$. To counter this, divide the scores by $\sqrt{d_k}$ before applying softmax:

$$
\text{softmax}\left(\frac{QK^T}{\sqrt{d_k}}\right)\in\mathbb{R}^{N\times N}
$$

```python
weights = torch.softmax(scores / d_k**0.5, dim=-1)
# each row sums to 1; above the diagonal is exactly 0
```

This brings the scores back to a variance of about $1$, which keeps softmax out of saturation and the training stable.

This final result can be interpreted as a look-up table. For token $i\in[1,N]$ in a context window of size $N$ tokens, column $j$ in row $i$ represents how much attention token $i$ pays to token $j$, and each row sums to $1$. For instance, when generating the token “tuna”, the weight on “cat” would be significantly higher than the weight on “the”.

### Values

Queries and keys allow the model to determine which tokens are relevant to other tokens in the context. The next step is to update the embeddings in the context to allow the tokens to pass information to whichever words they are relevant to. For instance, the embedding of “fluffy” should cause a change in the embedding of “cat” to reflect a “fluffy cat” in the encoding. To begin attacking this problem, there needs to be a **value matrix**. Again, like the query matrix, determining the value matrix requires a **weighted value matrix** $W_V\in\mathbb{R}^{d_\text{model}\times d_v}$, where the values are parameters and the patterns are learned in training. $d_v$ is the per-head value vector dimension, but in base models $d_v=d_k$. Then, the value matrix for all tokens in the context can be calculated with matrix multiplication:

$$
V=EW_V\in\mathbb{R}^{N\times d_v}
$$

```python
W_V = nn.Linear(d_model, d_v, bias=False)
V = W_V(E)  # torch.Size([7, 5])
```

### Applying Attention to the Values

The attention matrix and the value matrix now come together. Let $A$ be the result of the previous section: the masked, scaled softmax $\text{softmax}\left(\frac{QK^T}{\sqrt{d_k}}\right)$. Multiplying it by the value matrix gives one new vector per token:

$$
AV\in\mathbb{R}^{N\times d_v}
$$

Row $i$ of this product is a weighted sum of the value vectors, where the weights are row $i$ of $A$. Because of the mask, only token $i$ and the tokens before it contribute:

$$
(AV)_i=\sum_{j=1}^{i}A_{ij}V_j
$$

For “cat”, the sum runs over “the”, “blue”, “fluffy”, and “cat” itself. If “cat” attends strongly to “fluffy”, its output is mostly the value vector of “fluffy”. This is how “fluffy” passes information to “cat”.

```python
out = weights @ V  # torch.Size([7, 5])

# "cat" is row 3: a weighted sum of the first four values
weighted = (weights[3, :4, None] * V[:4]).sum(dim=0)
torch.allclose(out[3], weighted)  # True
```

### Multi-Head Attention

Everything so far describes a single **attention head**. In multi-head attention, $h$ heads run side by side, each with its own $W_Q$, $W_K$, and $W_V$, so each head can learn to look for a different kind of relationship, such as one head linking adjectives to nouns while another links verbs to their subjects. Head $m$ produces its own output:

$$
\text{head}_m=\text{softmax}\left(\frac{Q_mK_m^T}{\sqrt{d_k}}\right)V_m\in\mathbb{R}^{N\times d_v}
$$

Since $d_v=d_k=\frac{d_\text{model}}{h}$, placing the $h$ outputs side by side gives back a matrix with $d_\text{model}$ columns. An **output matrix** $W_O\in\mathbb{R}^{hd_v\times d_\text{model}}$, also learned in training, mixes the heads together:

$$
\text{MultiHead}(E)=\begin{bmatrix}\text{head}_1 & \cdots & \text{head}_h\end{bmatrix}W_O\in\mathbb{R}^{N\times d_\text{model}}
$$

Finally, the result is added back to the embeddings. This is the update promised at the start of the Values section, and it is called a **residual connection**:

$$
E\leftarrow E+\text{MultiHead}(E)
$$

```python
class Head(nn.Module):
    def __init__(self):
        super().__init__()
        self.W_Q = nn.Linear(d_model, d_k, bias=False)
        self.W_K = nn.Linear(d_model, d_k, bias=False)
        self.W_V = nn.Linear(d_model, d_v, bias=False)

    def forward(self, E):
        Q, K, V = self.W_Q(E), self.W_K(E), self.W_V(E)
        scores = (Q @ K.T).masked_fill(~mask, float("-inf"))
        return torch.softmax(scores / d_k**0.5, dim=-1) @ V

heads = [Head() for _ in range(h)]
W_O = nn.Linear(h * d_v, d_model, bias=False)

multi = torch.cat([head(E) for head in heads], dim=-1)
E = E + W_O(multi)  # still torch.Size([7, 10])
```

## What Comes Next

This is one attention layer, and it is the core of the transformer. A full GPT model builds on it in a few ways. It adds **positional embeddings**, so the model knows where each token sits in the sentence. It follows each attention layer with a small **feed-forward network** that processes every token on its own, and wraps both in **layer normalization** to keep training stable. Then it stacks many of these blocks. At the very end, the final embeddings are multiplied by a matrix of size $d_\text{model}\times V$ to produce a score for every token in the vocabulary, and a softmax over those scores gives the probability of each possible next token.
