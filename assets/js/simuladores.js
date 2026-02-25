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

  function clearError(id) {
    var el = document.getElementById(id);
    el.hidden = true;
    el.innerHTML = '';
  }

  // ================================
  // 1) Taxa de Esforço
  // ================================
  var fEsforco = document.getElementById('formEsforco');
  if (fEsforco) {
    fEsforco.addEventListener('submit', function (e) {
      e.preventDefault();
      var res = document.getElementById('resultEsforco');
      clearError('resultEsforco');

      var rendimento = val('ef_rendimento');
      var prestacoes = val('ef_prestacoes');
      var nova = val('ef_nova') || 0;

      if (!rendimento || rendimento <= 0 || prestacoes === null || prestacoes < 0) {
        showError(res, 'Por favor preenche todos os campos obrigatórios.');
        return;
      }

      var taxaAtual = (prestacoes / rendimento) * 100;
      var taxaComNova = ((prestacoes + nova) / rendimento) * 100;

      var badge, badgeClass;
      var taxaFinal = nova > 0 ? taxaComNova : taxaAtual;
      if (taxaFinal < 30) { badge = '✅ Zona segura'; badgeClass = 'badge-green'; }
      else if (taxaFinal <= 40) { badge = '⚠️ Atenção: limite recomendado'; badgeClass = 'badge-yellow'; }
      else { badge = '🚨 Risco elevado, taxa de esforço alta'; badgeClass = 'badge-red'; }

      var html = '<h3>Resultado</h3>';
      html += '<div class="result-row highlight-row"><span>Taxa de esforço atual</span><span>' + fmt(taxaAtual) + ' %</span></div>';
      if (nova > 0) {
        html += '<div class="result-row highlight-row"><span>Taxa de esforço com novo crédito</span><span>' + fmt(taxaComNova) + ' %</span></div>';
      }
      html += '<div class="result-badge ' + badgeClass + '">' + badge + '</div>';

      res.hidden = false;
      res.innerHTML = html;
    });
  }

  // ================================
  // 2) Crédito Automóvel
  // ================================
  var fAuto = document.getElementById('formAutomovel');
  if (fAuto) {
    fAuto.addEventListener('submit', function (e) {
      e.preventDefault();
      var res = document.getElementById('resultAutomovel');
      clearError('resultAutomovel');

      var valor = val('au_valor');
      var entrada = val('au_entrada') || 0;
      var prazo = val('au_prazo');
      var taxa = val('au_taxa');

      if (!valor || valor <= 0 || !prazo || prazo <= 0 || taxa === null || taxa < 0) {
        showError(res, 'Por favor preenche todos os campos obrigatórios.');
        return;
      }
      if (entrada >= valor) {
        showError(res, 'A entrada não pode ser igual ou superior ao valor do carro.');
        return;
      }

      var montante = valor - entrada;
      var rm = (taxa / 100) / 12;
      var n = Math.round(prazo);
      var prestacao = pmt(montante, rm, n);
      var total = prestacao * n;
      var juros = total - montante;

      var html = '<h3>Resultado</h3>';
      html += '<div class="result-row"><span>Montante financiado</span><span>' + fmt(montante) + ' €</span></div>';
      html += '<div class="result-row highlight-row"><span>Prestação mensal</span><span>' + fmt(prestacao) + ' €</span></div>';
      html += '<div class="result-row"><span>Total pago</span><span>' + fmt(total) + ' €</span></div>';
      html += '<div class="result-row"><span>Total de juros</span><span>' + fmt(juros) + ' €</span></div>';
      html += '<p class="result-note">Valores aproximados. A TAEG real depende da entidade financeira.</p>';

      res.hidden = false;
      res.innerHTML = html;
    });
  }

  // ================================
  // 3) Crédito Pessoal
  // ================================
  var fPessoal = document.getElementById('formPessoal');
  if (fPessoal) {
    fPessoal.addEventListener('submit', function (e) {
      e.preventDefault();
      var res = document.getElementById('resultPessoal');
      clearError('resultPessoal');

      var montante = val('cp_montante');
      var prazo = val('cp_prazo');
      var taxa = val('cp_taxa');

      if (!montante || montante <= 0 || !prazo || prazo <= 0 || taxa === null || taxa < 0) {
        showError(res, 'Por favor preenche todos os campos obrigatórios.');
        return;
      }

      var rm = (taxa / 100) / 12;
      var n = Math.round(prazo);
      var prestacao = pmt(montante, rm, n);
      var total = prestacao * n;
      var juros = total - montante;

      var html = '<h3>Resultado</h3>';
      html += '<div class="result-row highlight-row"><span>Prestação mensal</span><span>' + fmt(prestacao) + ' €</span></div>';
      html += '<div class="result-row"><span>Total pago</span><span>' + fmt(total) + ' €</span></div>';
      html += '<div class="result-row"><span>Total de juros</span><span>' + fmt(juros) + ' €</span></div>';
      html += '<p class="result-note">Valores aproximados. Consulta as condições da entidade financeira.</p>';

      res.hidden = false;
      res.innerHTML = html;
    });
  }

  // ================================
  // 4) Crédito Habitação
  // ================================
  // Auto-calculate montante
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
      clearError('resultHabitacao');

      var montante = val('ch_montante') || ((val('ch_imovel') || 0) - (val('ch_entrada') || 0));
      var prazoAnos = val('ch_prazo');
      var taxa = val('ch_taxa');

      if (!montante || montante <= 0 || !prazoAnos || prazoAnos <= 0 || taxa === null || taxa < 0) {
        showError(res, 'Por favor preenche todos os campos obrigatórios.');
        return;
      }

      var rm = (taxa / 100) / 12;
      var n = Math.round(prazoAnos * 12);
      var prestacao = pmt(montante, rm, n);
      var total = prestacao * n;
      var juros = total - montante;

      var html = '<h3>Resultado</h3>';
      html += '<div class="result-row"><span>Montante financiado</span><span>' + fmt(montante) + ' €</span></div>';
      html += '<div class="result-row highlight-row"><span>Prestação mensal</span><span>' + fmt(prestacao) + ' €</span></div>';
      html += '<div class="result-row"><span>Total pago (' + prazoAnos + ' anos)</span><span>' + fmt(total) + ' €</span></div>';
      html += '<div class="result-row"><span>Total de juros</span><span>' + fmt(juros) + ' €</span></div>';
      html += '<p class="result-note">⚠️ Taxa meramente indicativa. As condições reais dependem da avaliação bancária, spread, Euribor e outros fatores.</p>';

      res.hidden = false;
      res.innerHTML = html;
    });
  }

  // ================================
  // 5) Consolidação de Créditos
  // ================================
  var fCons = document.getElementById('formConsolidacao');
  if (fCons) {
    fCons.addEventListener('submit', function (e) {
      e.preventDefault();
      var res = document.getElementById('resultConsolidacao');
      clearError('resultConsolidacao');

      var m1 = val('co_m1') || 0;
      var p1 = val('co_p1') || 0;
      var m2 = val('co_m2') || 0;
      var p2 = val('co_p2') || 0;
      var m3 = val('co_m3') || 0;
      var p3 = val('co_p3') || 0;
      var taxaNova = val('co_taxa_nova');
      var prazoNovo = val('co_prazo_novo');

      var somaMontantes = m1 + m2 + m3;
      var somaPrestacoes = p1 + p2 + p3;

      if (somaMontantes <= 0 || somaPrestacoes <= 0 || taxaNova === null || taxaNova < 0 || !prazoNovo || prazoNovo <= 0) {
        showError(res, 'Por favor preenche pelo menos um crédito e os dados do novo crédito consolidado.');
        return;
      }

      var rm = (taxaNova / 100) / 12;
      var n = Math.round(prazoNovo);
      var prestacaoNova = pmt(somaMontantes, rm, n);
      var diferenca = somaPrestacoes - prestacaoNova;
      var totalNovo = prestacaoNova * n;
      var jurosNovos = totalNovo - somaMontantes;

      var html = '<h3>Resultado</h3>';
      html += '<div class="result-row"><span>Dívida total consolidada</span><span>' + fmt(somaMontantes) + ' €</span></div>';
      html += '<div class="result-row"><span>Prestações atuais (soma)</span><span>' + fmt(somaPrestacoes) + ' €/mês</span></div>';
      html += '<div class="result-row highlight-row"><span>Nova prestação consolidada</span><span>' + fmt(prestacaoNova) + ' €/mês</span></div>';

      if (diferenca > 0) {
        html += '<div class="result-row"><span>Poupança mensal</span><span style="color:#166534;font-weight:700">- ' + fmt(diferenca) + ' €</span></div>';
      } else if (diferenca < 0) {
        html += '<div class="result-row"><span>Aumento mensal</span><span style="color:#991b1b;font-weight:700">+ ' + fmt(Math.abs(diferenca)) + ' €</span></div>';
      }

      html += '<div class="result-row"><span>Total pago (novo crédito)</span><span>' + fmt(totalNovo) + ' €</span></div>';
      html += '<div class="result-row"><span>Total de juros (novo crédito)</span><span>' + fmt(jurosNovos) + ' €</span></div>';
      html += '<p class="result-note">⚠️ Atenção: consolidar créditos com um prazo mais longo pode reduzir a prestação mensal, mas aumentar o total de juros pagos.</p>';

      res.hidden = false;
      res.innerHTML = html;
    });
  }

})();
