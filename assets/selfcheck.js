/* AI Fluency — self-check widget (vanilla, no deps) */
(function () {
  function initQuestion(q) {
    var correct = parseInt(q.getAttribute('data-correct'), 10);
    var opts = q.querySelectorAll('.sc-opt');

    opts.forEach(function (opt, index) {
      opt.addEventListener('click', function () {
        if (q.classList.contains('revealed')) return;

        opts.forEach(function (o, i) {
          o.disabled = true;
          if (i === correct) o.classList.add('correct');
        });

        if (index !== correct) opt.classList.add('wrong');

        q.classList.add('revealed');
      });
    });
  }

  function init() {
    var questions = document.querySelectorAll('.sc-q');
    questions.forEach(initQuestion);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
