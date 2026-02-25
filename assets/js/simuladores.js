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
  bindSlider('ch_prazo', 'ch_prazo_label');
  bindSlider('co_prazo', 'co_prazo_label');

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
      var prazo = parseInt(document.getElementById('ch_prazo').value);

      if (!montante || montante <= 0) { showError(res, 'Por favor preenche o valor do imóvel e a entrada.'); return; }

      var rm = (TAN.habitacao / 100) / 12;
      var prestacao = pmt(montante, rm, prazo);
      var total = prestacao * prazo;
      var juros = total - montante;
      var anos = Math.floor(prazo / 12);

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
  // Toggle "dinheiro extra"
  var extraSim = document.getElementById('co_extra_sim');
  var extraNao = document.getElementById('co_extra_nao');
  var extraField = document.getElementById('co_extra_field');
  if (extraSim && extraNao && extraField) {
    extraSim.addEventListener('change', function () { extraField.hidden = false; });
    extraNao.addEventListener('change', function () { extraField.hidden = true; });
  }

  var fCons = document.getElementById('formConsolidacao');
  if (fCons) {
    fCons.addEventListener('submit', function (e) {
      e.preventDefault();
      var res = document.getElementById('resultConsolidacao');
      clearResult('resultConsolidacao');

      var totalDivida = val('co_total_divida');
      var totalPrestacoes = val('co_total_prestacoes');
      var extra = 0;
      if (extraSim && extraSim.checked) { extra = val('co_extra_valor') || 0; }
      var prazo = parseInt(document.getElementById('co_prazo').value);

      if (!totalDivida || totalDivida <= 0 || !totalPrestacoes || totalPrestacoes <= 0) {
        showError(res, 'Por favor preenche o valor total dos créditos e das prestações.');
        return;
      }

      var montante = totalDivida + extra;
      var rm = (TAN.consolidacao / 100) / 12;
      var prestacaoNova = pmt(montante, rm, prazo);
      var diferenca = totalPrestacoes - prestacaoNova;
      var totalNovo = prestacaoNova * prazo;
      var juros = totalNovo - montante;

      var html = '<h3>Resultado</h3>';
      html += '<div class="result-row"><span>Montante a consolidar</span><span>' + fmt(montante) + ' €</span></div>';
      html += '<div class="result-row"><span>Prestação atual total</span><span>' + fmt(totalPrestacoes) + ' €/mês</span></div>';
      html += '<div class="result-row highlight-row"><span>Nova prestação estimada</span><span>' + fmt(prestacaoNova) + ' €/mês</span></div>';

      if (diferenca > 0) {
        html += '<div class="result-row"><span>Poupança mensal estimada</span><span style="color:#166534;font-weight:700">- ' + fmt(diferenca) + ' €</span></div>';
      } else if (diferenca < 0) {
        html += '<div class="result-row"><span>Aumento mensal</span><span style="color:#991b1b;font-weight:700">+ ' + fmt(Math.abs(diferenca)) + ' €</span></div>';
      }

      html += '<div class="result-row"><span>Total pago (novo crédito)</span><span>' + fmt(totalNovo) + ' €</span></div>';
      html += '<div class="result-row"><span>Total de juros</span><span>' + fmt(juros) + ' €</span></div>';
      html += '<p class="result-note">⚠️ TAN indicativa de ' + TAN.consolidacao.toFixed(2).replace('.', ',') + '%. Simulação indicativa, não constitui proposta vinculativa. O aumento do prazo pode significar mais juros no total.</p>';

      res.hidden = false;
      res.innerHTML = html;
    });
  }

  // ================================
  // 5) Taxa de Esforço
  // ================================
  var fEsforco = document.getElementById('formEsforco');
  if (fEsforco) {
    fEsforco.addEventListener('submit', function (e) {
      e.preventDefault();
      var res = document.getElementById('resultEsforco');
      clearResult('resultEsforco');

      var rendimento = val('ef_rendimento');
      var prestacoes = val('ef_prestacoes');

      if (!rendimento || rendimento <= 0 || prestacoes === null || prestacoes < 0) {
        showError(res, 'Por favor preenche todos os campos obrigatórios.');
        return;
      }

      var taxa = (prestacoes / rendimento) * 100;
      var badge, badgeClass, msg;

      if (taxa < 50) {
        badge = '✅ ' + fmt(taxa).replace(/\s/g, '') + ' % — zona aceitável';
        badgeClass = 'badge-green';
      } else {
        badge = '🚨 ' + fmt(taxa).replace(/\s/g, '') + ' % — atenção: esforço muito elevado';
        badgeClass = 'badge-red';
      }

      var html = '<h3>Resultado</h3>';
      html += '<div class="result-row highlight-row"><span>Taxa de esforço</span><span>' + taxa.toFixed(1).replace('.', ',') + ' %</span></div>';
      html += '<div class="result-badge ' + badgeClass + '">' + badge + '</div>';

      res.hidden = false;
      res.innerHTML = html;
    });
  }

})();
