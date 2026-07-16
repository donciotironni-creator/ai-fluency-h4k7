(function () {
  // Don't run on the dictionary page itself
  if (location.pathname.replace(/.*\//, '') === 'dictionar.html') return;

  // Terms to match — sorted by length descending so multi-word terms match first
  var TERMS = [
    // multi-word first
    'RAG (Retrieval-Augmented Generation)',
    'MCP (Model Context Protocol)',
    'LLM (Large Language Model)',
    'RLHF (Reinforcement Learning from Human Feedback)',
    'SFT (Supervised Fine-Tuning)',
    'Chain-of-Thought',
    'Context engineering',
    'Prompt engineering',
    'Context window',
    'Prompt caching',
    'Structured output',
    'Function calling',
    'Mixture of Experts',
    'Vector database',
    'Semantic search',
    'Hybrid search',
    'Knowledge base',
    'Agentic loop',
    'Agentic RAG',
    'Control flow',
    'AI gateway',
    'Model routing',
    'Semantic caching',
    'Compound AI system',
    'Context compaction',
    // Claude Code
    'Progressive disclosure',
    'Straturi de memorie',
    'Slash commands',
    'Slash command',
    'Skills',
    'Skill',
    'Hooks',
    'Hook',
    'Plugins',
    'Plugin',
    'Permisiuni',
    'Git worktree',
    'allowed-tools',
    'argument-hint',
    'CLAUDE.md',
    'settings.json',
    'Plan mode',
    'Agent harness',
    'Human-in-the-loop',
    'Computer use',
    'Coding agent',
    'Multi-agent',
    'Prompt injection',
    'PII redaction',
    'Hallucination detection',
    'Red teaming',
    'Golden dataset',
    'Ground truth',
    'Regression testing',
    'Token budget',
    'Cost optimization',
    'Rate limit',
    'Image generation',
    'Diffusion model',
    'Voice agent',
    'Document AI',
    'Extended thinking',
    'Frontier model',
    'Foundation model',
    'Reasoning model',
    'Reward model',
    'Open weights',
    'Model card',
    'Build in public',
    'Vibe coding',
    'In-context learning',
    'Tool use',
    'HyDE',
    'GraphRAG',
    'Zero-shot',
    'Few-shot',
    'ReAct',
    'LoRA',
    'PEFT',
    'vLLM',
    'TTS',
    'STT',
    'OCR',
    'SWE-bench',
    'Ragas',
    // single-word terms (shorter, match last to avoid partial conflicts)
    'Fine-tuning',
    'Pretraining',
    'Scaffolding',
    'Frontmatter',
    'Headless',
    'Subagents',
    'Subagent',
    'Orchestration',
    'Observability',
    'Benchmarks',
    'Benchmark',
    'Throughput',
    'Streaming',
    'Batching',
    'Self-hosting',
    'Quantization',
    'Distillation',
    'Chunking',
    'Reranking',
    'Alignment',
    'Hallucinations',
    'Hallucination',
    'Embeddings',
    'Embedding',
    'Guardrails',
    'Jailbreak',
    'Grounding',
    'Inference',
    'Temperature',
    'Tokenization',
    'Transformer',
    'Multimodal',
    'Agentic',
    'Planning',
    'Autonomy',
    'Fallback',
    'Serving',
    'Tracing',
    'Vision',
    'Latency',
    'Policy',
    'Tokens',
    'Token',
    'Agents',
    'Agent',
    'Prompt',
    'LLM',
    'RAG',
    'MCP',
    'CoT',
    'GPU',
    'API',
  ];

  // Build regex — word-boundary aware, case-insensitive
  function escRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  var pattern = new RegExp(
    '(?<![\\w-])(' + TERMS.map(escRe).join('|') + ')(?![\\w-])',
    'gi'
  );

  // Walk text nodes inside .wrap, skip nav/code/pre/a/kicker
  function linkify(root) {
    var walker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: function (node) {
          var el = node.parentElement;
          if (!el) return NodeFilter.FILTER_REJECT;
          var tag = el.tagName;
          if (['A', 'CODE', 'PRE', 'SCRIPT', 'STYLE', 'BUTTON', 'H1'].includes(tag))
            return NodeFilter.FILTER_REJECT;
          if (el.closest('.site-nav, .kicker, .nav-pill, .badge, .tag, .artefact'))
            return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    var nodes = [];
    var n;
    while ((n = walker.nextNode())) nodes.push(n);

    var seen = new Set();

    nodes.forEach(function (textNode) {
      var text = textNode.textContent;
      pattern.lastIndex = 0;
      if (!pattern.test(text)) return;
      pattern.lastIndex = 0;

      var frag = document.createDocumentFragment();
      var last = 0;
      var m;

      while ((m = pattern.exec(text)) !== null) {
        if (m.index > last) {
          frag.appendChild(document.createTextNode(text.slice(last, m.index)));
        }

        var key = m[0].toLowerCase();
        if (!seen.has(key)) {
          seen.add(key);
          var a = document.createElement('a');
          a.href = 'dictionar.html?q=' + encodeURIComponent(m[0]);
          a.className = 'glossary-link';
          a.textContent = m[0];
          a.title = 'Dicționar AI Engineering';
          frag.appendChild(a);
        } else {
          frag.appendChild(document.createTextNode(m[0]));
        }

        last = m.index + m[0].length;
      }

      if (last < text.length) {
        frag.appendChild(document.createTextNode(text.slice(last)));
      }

      if (frag.childNodes.length > 1 ||
          (frag.firstChild && frag.firstChild.nodeType === Node.ELEMENT_NODE)) {
        textNode.parentNode.replaceChild(frag, textNode);
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.wrap').forEach(linkify);
  });
})();
