/* ============================================
   omeudinheiro – Simuladores JS
   ============================================ */

(function () {
  'use strict';

  // --- Helpers ---
  function val(id) {
    var v = parseFloat(document.getElementById(id).value);
    return isNaN(v) ? null : v;
  }

  function fmt(n) {
    return n.toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function pmt(principal, rateMonth, nMonths) {
    if (rateMonth === 0) return principal / nMonths;
    var x = Math.pow(1 + rateMonth, nMonths);
    return principal * (rateMonth * x) / (x - 1);
  }

  function showError(container, msg) {
    container.hidden = false;
    container.innerHTML = '<div class="sim-error">' + msg + '</div>';
  }

  function clearResult(id) {
    var el = document.getElementById(id);
    el.hidden = true;
    el.innerHTML = '';
  }

  function formatPrazo(meses) {
    var anos = Math.floor(meses / 12);
    var resto = meses % 12;
    var txt = meses + ' meses';
    if (anos > 0 && resto === 0) txt += ' (' + anos + (anos === 1 ? ' ano' : ' anos') + ')';
    else if (anos > 0) txt += ' (' + anos + (anos === 1 ? ' ano' : ' anos') + ' e ' + resto + (resto === 1 ? ' mês' : ' meses') + ')';
    return txt;
  }

  // ================================
  // MENU ↔ PANEL NAVIGATION
  // ================================
  var simMenu = document.getElementById('simMenu');
  var menuCards = document.querySelectorAll('.sim-menu-card');
  var simPanels = document.querySelectorAll('.sim-panel');
  var backBtns = document.querySelectorAll('.sim-back');

  function showMenu() {
    simPanels.forEach(function (p) { p.hidden = true; });
    if (simMenu) simMenu.hidden = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function openPanel(name) {
    if (simMenu) simMenu.hidden = true;
    simPanels.forEach(function (p) { p.hidden = true; });
    var panel = document.getElementById('panel-' + name);
    if (panel) { panel.hidden = false; }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  menuCards.forEach(function (card) {
    card.addEventListener('click', function () { openPanel(card.dataset.open); });
  });

  backBtns.forEach(function (btn) {
    btn.addEventListener('click', function () { showMenu(); });
  });

  // Support direct linking via hash (e.g. simuladores.html#habitacao)
  if (window.location.hash) {
    var target = window.location.hash.substring(1);
    var targetPanel = document.getElementById('panel-' + target);
    if (targetPanel) { openPanel(target); }
  }

  // ================================
  // SLIDERS — live label updates
  // ================================
  function bindSlider(sliderId, labelId) {
    var slider = document.getElementById(sliderId);
    var label = document.getElementById(labelId);
    if (!slider || !label) return;
    function update() { label.textContent = formatPrazo(parseInt(slider.value)); }
    slider.addEventListener('input', update);
    update();
  }

  bindSlider('au_prazo', 'au_prazo_label');
  bindSlider('cp_prazo', 'cp_prazo_label');
  // --- Age → Prazo calculation ---
  function calcPrazoFromAge(idade) {
    if (idade <= 30) return 40;
    if (idade <= 35) return 37;
    if (idade <= 40) return 37;
    return Math.max(5, 75 - idade);
  }

  function bindAge(inputId, labelId) {
    var input = document.getElementById(inputId);
    var label = document.getElementById(labelId);
    if (!input || !label) return;
    function update() {
      var idade = parseInt(input.value);
      if (isNaN(idade) || idade < 18) { label.textContent = '—'; return; }
      var anos = calcPrazoFromAge(idade);
      label.textContent = anos + ' anos (' + (anos * 12) + ' meses)';
    }
    input.addEventListener('input', update);
    update();
  }

  bindAge('ch_idade', 'ch_prazo_auto');
  bindAge('co_idade', 'co_prazo_auto');
  bindAge('ef_idade', 'ef_prazo_auto');

  // ================================
  // TAN values (fixed)
  // ================================
  var TAN = {
    automovel: 8.10,
    pessoal: 8.60,
    habitacao: 2.60,
    consolidacao: 2.60
  };

  // ================================
  // 1) Crédito Automóvel
  // ================================
  var fAuto = document.getElementById('formAutomovel');
  if (fAuto) {
    fAuto.addEventListener('submit', function (e) {
      e.preventDefault();
      var res = document.getElementById('resultAutomovel');
      clearResult('resultAutomovel');

      var valor = val('au_valor');
      var entrada = val('au_entrada') || 0;
      var prazo = parseInt(document.getElementById('au_prazo').value);

      if (!valor || valor <= 0) { showError(res, 'Por favor preenche o valor do carro.'); return; }
      if (entrada >= valor) { showError(res, 'A entrada não pode ser igual ou superior ao valor do carro.'); return; }

      var montante = valor - entrada;
      var rm = (TAN.automovel / 100) / 12;
      var prestacao = pmt(montante, rm, prazo);
      var total = prestacao * prazo;
      var juros = total - montante;

      var html = '<h3>Resultado</h3>';
      html += '<div class="result-row"><span>Montante financiado</span><span>' + fmt(montante) + ' €</span></div>';
      html += '<div class="result-row highlight-row"><span>Prestação mensal</span><span>' + fmt(prestacao) + ' €</span></div>';
      html += '<div class="result-row"><span>Total pago</span><span>' + fmt(total) + ' €</span></div>';
      html += '<div class="result-row"><span>Total de juros</span><span>' + fmt(juros) + ' €</span></div>';
      html += '<p class="result-note">TAN fixa de ' + TAN.automovel.toFixed(2).replace('.', ',') + '%. Valores aproximados — consulta a entidade financeira.</p>';

      res.hidden = false;
      res.innerHTML = html;
    });
  }

  // ================================
  // 2) Crédito Pessoal
  // ================================
  var fPessoal = document.getElementById('formPessoal');
  if (fPessoal) {
    fPessoal.addEventListener('submit', function (e) {
      e.preventDefault();
      var res = document.getElementById('resultPessoal');
      clearResult('resultPessoal');

      var montante = val('cp_montante');
      var prazo = parseInt(document.getElementById('cp_prazo').value);

      if (!montante || montante <= 0) { showError(res, 'Por favor preenche o montante desejado.'); return; }

      var rm = (TAN.pessoal / 100) / 12;
      var prestacao = pmt(montante, rm, prazo);
      var total = prestacao * prazo;
      var juros = total - montante;

      var html = '<h3>Resultado</h3>';
      html += '<div class="result-row highlight-row"><span>Prestação mensal</span><span>' + fmt(prestacao) + ' €</span></div>';
      html += '<div class="result-row"><span>Total pago</span><span>' + fmt(total) + ' €</span></div>';
      html += '<div class="result-row"><span>Total de juros</span><span>' + fmt(juros) + ' €</span></div>';
      html += '<p class="result-note">TAN fixa de ' + TAN.pessoal.toFixed(2).replace('.', ',') + '%. Valores aproximados.</p>';

      res.hidden = false;
      res.innerHTML = html;
    });
  }

  // ================================
  // 3) Crédito Habitação
  // ================================
  var chImovel = document.getElementById('ch_imovel');
  var chEntrada = document.getElementById('ch_entrada');
  var chMontante = document.getElementById('ch_montante');
  if (chImovel && chEntrada && chMontante) {
    function calcMontante() {
      var i = parseFloat(chImovel.value) || 0;
      var e = parseFloat(chEntrada.value) || 0;
      if (i > 0 && !chMontante._userEdited) {
        chMontante.value = Math.max(0, i - e);
      }
    }
    chImovel.addEventListener('input', calcMontante);
    chEntrada.addEventListener('input', calcMontante);
    chMontante.addEventListener('input', function () { chMontante._userEdited = true; });
  }

  var fHab = document.getElementById('formHabitacao');
  if (fHab) {
    fHab.addEventListener('submit', function (e) {
      e.preventDefault();
      var res = document.getElementById('resultHabitacao');
      clearResult('resultHabitacao');

      var montante = val('ch_montante') || ((val('ch_imovel') || 0) - (val('ch_entrada') || 0));
      var idade = val('ch_idade');

      if (!montante || montante <= 0) { showError(res, 'Por favor preenche o valor do imóvel e a entrada.'); return; }
      if (!idade || idade < 18) { showError(res, 'Por favor indica a idade da pessoa mais velha.'); return; }

      var anos = calcPrazoFromAge(idade);
      var prazo = anos * 12;
      var rm = (TAN.habitacao / 100) / 12;
      var prestacao = pmt(montante, rm, prazo);
      var total = prestacao * prazo;
      var juros = total - montante;

      var html = '<h3>Resultado</h3>';
      html += '<div class="result-row"><span>Montante financiado</span><span>' + fmt(montante) + ' €</span></div>';
      html += '<div class="result-row highlight-row"><span>Prestação mensal</span><span>' + fmt(prestacao) + ' €</span></div>';
      html += '<div class="result-row"><span>Total pago (' + anos + ' anos)</span><span>' + fmt(total) + ' €</span></div>';
      html += '<div class="result-row"><span>Total de juros</span><span>' + fmt(juros) + ' €</span></div>';
      html += '<p class="result-note">⚠️ TAN indicativa de ' + TAN.habitacao.toFixed(2).replace('.', ',') + '%. As condições reais dependem da avaliação bancária, spread, Euribor e outros fatores.</p>';

      res.hidden = false;
      res.innerHTML = html;
    });
  }

  // ================================
  // 4) Consolidação de Créditos
  // ================================
  // Toggle "tem crédito habitação?"
  var coHabSim = document.getElementById('co_hab_sim');
  var coHabNao = document.getElementById('co_hab_nao');
  var coHabFields = document.getElementById('co_hab_fields');
  if (coHabSim && coHabNao && coHabFields) {
    coHabSim.addEventListener('change', function () { coHabFields.hidden = false; });
    coHabNao.addEventListener('change', function () { coHabFields.hidden = true; });
  }

  // Toggle "dinheiro extra"
  var extraSim = document.getElementById('co_extra_sim');
  var extraNao = document.getElementById('co_extra_nao');
  var extraField = document.getElementById('co_extra_field');
  if (extraSim && extraNao && extraField) {
    extraSim.addEventListener('change', function () { extraField.hidden = false; });
    extraNao.addEventListener('change', function () { extraField.hidden = true; });
  }

  // Lead form handler (inside results)
  function handleLeadForm() {
    var form = document.getElementById('leadFormCons');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var nome = document.getElementById('lead_nome');
      var email = document.getElementById('lead_email');
      var tel = document.getElementById('lead_tel');
      var feedback = document.getElementById('leadFeedback');
      var valid = true;
      [nome, email, tel].forEach(function (f) { f.classList.remove('error'); });

      if (!nome.value.trim()) { nome.classList.add('error'); valid = false; }
      if (!tel.value.trim()) { tel.classList.add('error'); valid = false; }
      if (!email.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) { email.classList.add('error'); valid = false; }

      if (!valid) {
        feedback.hidden = false;
        feedback.className = 'form-feedback error';
        feedback.textContent = 'Por favor preenche todos os campos corretamente.';
        return;
      }
      feedback.hidden = false;
      feedback.className = 'form-feedback success';
      feedback.textContent = '✅ Obrigado, ' + nome.value.trim() + '! Vamos enviar-te uma proposta personalizada em breve.';
      form.reset();
    });
  }

  var fCons = document.getElementById('formConsolidacao');
  if (fCons) {
    fCons.addEventListener('submit', function (e) {
      e.preventDefault();
      var res = document.getElementById('resultConsolidacao');
      clearResult('resultConsolidacao');

      var temHab = coHabSim && coHabSim.checked;
      var habEmprestimo = temHab ? (val('co_hab_emprestimo') || 0) : 0;
      var habPrestacao = temHab ? (val('co_hab_prestacao') || 0) : 0;
      var outrosDivida = val('co_total_divida') || 0;
      var outrosPrestacoes = val('co_total_prestacoes') || 0;
      var extra = (extraSim && extraSim.checked) ? (val('co_extra_valor') || 0) : 0;
      var rendimento = val('co_rendimento');
      var idade = val('co_idade');

      // Validation
      if (outrosDivida <= 0 && habEmprestimo <= 0) {
        showError(res, 'Por favor preenche o valor dos créditos.');
        return;
      }
      if (outrosPrestacoes <= 0 && habPrestacao <= 0) {
        showError(res, 'Por favor preenche o valor das prestações.');
        return;
      }
      if (!rendimento || rendimento <= 0) {
        showError(res, 'Por favor preenche o rendimento mensal.');
        return;
      }
      if (!idade || idade < 18) {
        showError(res, 'Por favor indica a idade da pessoa mais velha.');
        return;
      }
      var prazoAnos = calcPrazoFromAge(idade);
      var prazo = prazoAnos * 12;
      if (temHab && (!habEmprestimo || habEmprestimo <= 0)) {
        showError(res, 'Por favor preenche o valor do empréstimo habitação.');
        return;
      }

      var totalDivida = habEmprestimo + outrosDivida + extra;
      var totalPrestacoes = habPrestacao + outrosPrestacoes;

      var rm = (TAN.consolidacao / 100) / 12;
      var prestacaoNova = pmt(totalDivida, rm, prazo);
      var diferenca = totalPrestacoes - prestacaoNova;
      var totalNovo = prestacaoNova * prazo;
      var juros = totalNovo - totalDivida;
      var taxaEsforcoAntes = (totalPrestacoes / rendimento) * 100;
      var taxaEsforcoDepois = (prestacaoNova / rendimento) * 100;

      var html = '<h3>Resultado da Consolidação</h3>';

      if (temHab) {
        html += '<div class="result-row"><span>Empréstimo habitação</span><span>' + fmt(habEmprestimo) + ' €</span></div>';
        html += '<div class="result-row"><span>Outros créditos</span><span>' + fmt(outrosDivida) + ' €</span></div>';
        if (extra > 0) html += '<div class="result-row"><span>Dinheiro extra</span><span>' + fmt(extra) + ' €</span></div>';
      }

      html += '<div class="result-row"><span>Montante total a consolidar</span><span>' + fmt(totalDivida) + ' €</span></div>';
      html += '<div class="result-row"><span>Prestação atual total</span><span>' + fmt(totalPrestacoes) + ' €/mês</span></div>';
      html += '<div class="result-row highlight-row"><span>Nova prestação estimada</span><span>' + fmt(prestacaoNova) + ' €/mês</span></div>';

      if (diferenca > 0) {
        html += '<div class="result-row"><span>Poupança mensal estimada</span><span style="color:#166534;font-weight:700">- ' + fmt(diferenca) + ' €</span></div>';
      } else if (diferenca < 0) {
        html += '<div class="result-row"><span>Aumento mensal</span><span style="color:#991b1b;font-weight:700">+ ' + fmt(Math.abs(diferenca)) + ' €</span></div>';
      }

      // Taxa de esforço
      var badgeAntes = taxaEsforcoAntes < 50 ? 'badge-green' : 'badge-red';
      var badgeDepois = taxaEsforcoDepois < 50 ? 'badge-green' : 'badge-red';
      html += '<div style="margin-top:1rem"><strong>Taxa de Esforço</strong></div>';
      html += '<div class="result-row"><span>Antes</span><span class="result-badge ' + badgeAntes + '" style="margin:0;padding:.25rem .75rem">' + taxaEsforcoAntes.toFixed(1).replace('.', ',') + ' %</span></div>';
      html += '<div class="result-row"><span>Depois</span><span class="result-badge ' + badgeDepois + '" style="margin:0;padding:.25rem .75rem">' + taxaEsforcoDepois.toFixed(1).replace('.', ',') + ' %</span></div>';

      html += '<div class="result-row"><span>Total pago (novo crédito)</span><span>' + fmt(totalNovo) + ' €</span></div>';
      html += '<div class="result-row"><span>Total de juros</span><span>' + fmt(juros) + ' €</span></div>';

      html += '<p class="result-note">⚠️ TAN indicativa de ' + TAN.consolidacao.toFixed(2).replace('.', ',') + '%. Simulação indicativa, não constitui proposta vinculativa.</p>';

      // Lead form
      html += '<div class="lead-form-box">';
      html += '<h3>📩 Receber proposta personalizada</h3>';
      html += '<p>Deixa os teus dados e um especialista entrará em contacto contigo.</p>';
      html += '<form id="leadFormCons" novalidate>';
      html += '<div class="field"><label for="lead_nome">Nome *</label><input type="text" id="lead_nome" placeholder="O teu nome" required></div>';
      html += '<div class="field"><label for="lead_tel">Telefone *</label><input type="tel" id="lead_tel" placeholder="Ex: 912345678" required></div>';
      html += '<div class="field"><label for="lead_email">Email *</label><input type="email" id="lead_email" placeholder="email@exemplo.com" required></div>';
      html += '<button type="submit" class="btn btn-primary">Enviar pedido</button>';
      html += '<div class="form-feedback" id="leadFeedback" hidden></div>';
      html += '</form></div>';

      res.hidden = false;
      res.innerHTML = html;
      handleLeadForm();
    });
  }

  // ================================
  // 5) Até que valor posso comprar casa?
  // ================================
  // Toggles
  var efPrestSim = document.getElementById('ef_prest_sim');
  var efPrestNao = document.getElementById('ef_prest_nao');
  var efPrestField = document.getElementById('ef_prest_field');
  if (efPrestSim && efPrestNao && efPrestField) {
    efPrestSim.addEventListener('change', function () { efPrestField.hidden = false; });
    efPrestNao.addEventListener('change', function () { efPrestField.hidden = true; });
  }
  var efFilhosSim = document.getElementById('ef_filhos_sim');
  var efFilhosNao = document.getElementById('ef_filhos_nao');
  var efFilhosField = document.getElementById('ef_filhos_field');
  if (efFilhosSim && efFilhosNao && efFilhosField) {
    efFilhosSim.addEventListener('change', function () { efFilhosField.hidden = false; });
    efFilhosNao.addEventListener('change', function () { efFilhosField.hidden = true; });
  }

  // Lead form handler (reusable)
  function handleLeadFormById(formId, feedbackId) {
    var form = document.getElementById(formId);
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var inputs = form.querySelectorAll('input[required]');
      var feedback = document.getElementById(feedbackId);
      var valid = true;
      inputs.forEach(function (f) { f.classList.remove('error'); });
      inputs.forEach(function (f) {
        if (!f.value.trim()) { f.classList.add('error'); valid = false; }
        if (f.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value)) { f.classList.add('error'); valid = false; }
      });
      if (!valid) {
        feedback.hidden = false;
        feedback.className = 'form-feedback error';
        feedback.textContent = 'Por favor preenche todos os campos corretamente.';
        return;
      }
      var nome = form.querySelector('input[type="text"]');
      feedback.hidden = false;
      feedback.className = 'form-feedback success';
      feedback.textContent = '✅ Obrigado' + (nome ? ', ' + nome.value.trim() : '') + '! Vamos enviar-te uma proposta personalizada em breve.';
      form.reset();
    });
  }

  var fEsforco = document.getElementById('formEsforco');
  if (fEsforco) {
    fEsforco.addEventListener('submit', function (e) {
      e.preventDefault();
      var res = document.getElementById('resultEsforco');
      clearResult('resultEsforco');

      var idade = val('ef_idade');
      var rendimento = val('ef_rendimento');
      var temPrestacoes = efPrestSim && efPrestSim.checked;
      var prestacoes = temPrestacoes ? (val('ef_prestacoes') || 0) : 0;
      var temFilhos = efFilhosSim && efFilhosSim.checked;
      var nFilhos = temFilhos ? (val('ef_filhos') || 0) : 0;
      var custoFilhos = nFilhos * 50;

      if (!idade || idade < 18) { showError(res, 'Por favor indica a idade.'); return; }
      if (!rendimento || rendimento <= 0) { showError(res, 'Por favor indica o rendimento mensal.'); return; }

      // Prazo
      var prazoAnos = calcPrazoFromAge(idade);
      var prazoMeses = prazoAnos * 12;

      // Taxa de esforço de 50%: prestação máxima para habitação
      var maxTotalPrestacao = rendimento * 0.50;
      var prestacaoMaxHabitacao = maxTotalPrestacao - prestacoes - custoFilhos;

      if (prestacaoMaxHabitacao <= 0) {
        showError(res, 'Com as tuas despesas atuais, não há margem para uma prestação de habitação a 50% de taxa de esforço.');
        return;
      }

      // Reverse PMT: from prestação → montante máximo
      var rm = (TAN.habitacao / 100) / 12;
      var montanteMax;
      if (rm === 0) {
        montanteMax = prestacaoMaxHabitacao * prazoMeses;
      } else {
        var x = Math.pow(1 + rm, prazoMeses);
        montanteMax = prestacaoMaxHabitacao * (x - 1) / (rm * x);
      }

      var taxaEsforco = ((prestacoes + custoFilhos + prestacaoMaxHabitacao) / rendimento) * 100;

      var html = '<h3>Resultado</h3>';
      html += '<div class="result-row"><span>Prazo máximo</span><span>' + prazoAnos + ' anos</span></div>';
      html += '<div class="result-row"><span>Rendimento mensal</span><span>' + fmt(rendimento) + ' €</span></div>';
      if (prestacoes > 0) html += '<div class="result-row"><span>Outras prestações</span><span>' + fmt(prestacoes) + ' €/mês</span></div>';
      if (custoFilhos > 0) html += '<div class="result-row"><span>Custo filhos (' + nFilhos + ')</span><span>' + fmt(custoFilhos) + ' €/mês</span></div>';
      html += '<div class="result-row highlight-row"><span>Prestação máxima habitação</span><span>' + fmt(prestacaoMaxHabitacao) + ' €/mês</span></div>';
      html += '<div class="result-row highlight-row"><span>Valor máximo do imóvel (financiamento)</span><span>' + fmt(montanteMax) + ' €</span></div>';
      html += '<div class="result-row"><span>Taxa de esforço</span><span class="result-badge badge-green" style="margin:0;padding:.25rem .75rem">50,0 %</span></div>';
      html += '<p class="result-note">⚠️ Cálculo baseado numa TAN indicativa de ' + TAN.habitacao.toFixed(2).replace('.', ',') + '% a ' + prazoAnos + ' anos. O valor do imóvel pode ser superior se deres uma entrada inicial. Simulação não vinculativa.</p>';

      // Lead form
      html += '<div class="lead-form-box">';
      html += '<h3>📩 Receber proposta personalizada</h3>';
      html += '<p>Deixa os teus dados e um especialista entrará em contacto contigo.</p>';
      html += '<form id="leadFormEsforco" novalidate>';
      html += '<div class="field"><label for="lead2_nome">Nome *</label><input type="text" id="lead2_nome" placeholder="O teu nome" required></div>';
      html += '<div class="field"><label for="lead2_tel">Telefone *</label><input type="tel" id="lead2_tel" placeholder="Ex: 912345678" required></div>';
      html += '<div class="field"><label for="lead2_email">Email *</label><input type="email" id="lead2_email" placeholder="email@exemplo.com" required></div>';
      html += '<button type="submit" class="btn btn-primary">Enviar pedido</button>';
      html += '<div class="form-feedback" id="leadFeedbackEsforco" hidden></div>';
      html += '</form></div>';

      res.hidden = false;
      res.innerHTML = html;
      handleLeadFormById('leadFormEsforco', 'leadFeedbackEsforco');
    });
  }

})();
