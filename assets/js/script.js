(async function(){
    let moedas = await buscarMoedasFETCH();
    console.log(moedas);
    carregarSelectMoedas(moedas);
})()

async function buscarMoedasFETCH(){
    var resposta = await fetch("https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/Moedas?$top=100&$format=json&$select=simbolo,nomeFormatado,tipoMoeda")
    return resposta.json();
}

function carregarSelectMoedas(moedas){
    let moedasOrigem = document.getElementById('moedaOrigem')
    let moedasDestino = document.getElementById('moedaDestino')
    for (let i = 0; i < moedas.value.length; i++) {
        let optionMoeda = document.createElement("option")
        optionMoeda.value = moedas.value[i].simbolo
        optionMoeda.innerText = moedas.value[i].nomeFormatado
        moedasDestino.appendChild(optionMoeda)
    }
    for (let i = 0; i < moedas.value.length; i++) {
        let optionMoeda = document.createElement("option")
        optionMoeda.value = moedas.value[i].simbolo
        optionMoeda.innerText = moedas.value[i].nomeFormatado
        moedasOrigem.appendChild(optionMoeda)
    }
}

document.getElementById('cambioForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    const moedaOrigem = document.getElementById('moedaOrigem').value;
    const moedaDestino = document.getElementById('moedaDestino').value;
    const valor = parseFloat(document.getElementById('valor').value);
    const tipoCotacao = document.getElementById('tipoCotacao').value;

    const taxaCambio = await obterTaxaCambio(moedaOrigem, moedaDestino, tipoCotacao);

    const valorConvertido = calcularCambio(valor, taxaCambio);

    exibirResultado(valor, moedaOrigem, valorConvertido, moedaDestino, tipoCotacao);
});

async function obterTaxaCambio(moedaOrigem, moedaDestino, tipoCotacao) {
    const resposta = await fetch(`https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/CotacaoMoedaDia(moeda=@moedaOrigem,dataCotacao=@dataCotacao)?$top=1&$format=json&@moedaOrigem='${moedaOrigem}'&@dataCotacao='${formatarDataAtual()}'`);
    const cotacao = await resposta.json();

    return tipoCotacao === 'compra' ? cotacao.value[0].cotacaoCompra : cotacao.value[0].cotacaoVenda;
}

function calcularCambio(valor, taxaCambio) {
    return valor * taxaCambio;
}

function exibirResultado(valorOrigem, moedaOrigem, valorConvertido, moedaDestino, tipoCotacao) {
    const resultadoCambio = document.getElementById('resultadoCambio');
    resultadoCambio.innerHTML = `
        <p>Valor ${tipoCotacao === 'compra' ? 'recebido' : 'pago'} em ${moedaOrigem}: ${valorOrigem.toFixed(2)} ${moedaOrigem}</p>
        <p>Valor convertido em ${moedaDestino}: ${valorConvertido.toFixed(2)} ${moedaDestino}</p>
    `;
}

function formatarDataAtual() {
    const data = new Date();
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();
    return `${ano}-${mes}-${dia}`;
}