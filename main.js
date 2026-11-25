
const numeroSenha = document.querySelector('.parametro-senha__texto');
const campoSenha = document.querySelector('#campo-senha');
const botoes = document.querySelectorAll('.parametro-senha__botao');
const checkbox = document.querySelectorAll('.checkbox');
const forcaSenha = document.querySelector('.forca');
const valorEntropia = document.querySelector('.entropia');
const mensagemForca = document.querySelector('#mensagem-forca');
const mensagem = document.querySelector('#mensagem');
const botaoGerar = document.querySelector('#botao-gerar');
const botaoCopiar = document.querySelector('#botao-copiar');

let tamanhoSenha = 12;

numeroSenha.textContent = tamanhoSenha;

const letrasMaiusculas = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const letrasMinusculas = 'abcdefghijklmnopqrstuvwxyz';
const numeros = '0123456789';
const simbolos = '!@%*?';

botoes[0].onclick = diminuiTamanho;
botoes[1].onclick = aumentaTamanho;
botaoGerar.onclick = geraSenha;
botaoCopiar.onclick = copiarSenha;

for (let i = 0; i < checkbox.length; i++) {
    checkbox[i].onclick = geraSenha;
}

function diminuiTamanho() {
    if (tamanhoSenha > 1) {
        tamanhoSenha--;
    }

    numeroSenha.textContent = tamanhoSenha;
    geraSenha();
}

function aumentaTamanho() {
    if (tamanhoSenha < 20) {
        tamanhoSenha++;
    }

    numeroSenha.textContent = tamanhoSenha;
    geraSenha();
}

function numeroAleatorio(maximo) {
    const valor = new Uint32Array(1);
    crypto.getRandomValues(valor);

    return valor[0] % maximo;
}

function geraSenha() {
    mensagem.textContent = '';

    let alfabeto = '';
    let grupos = [];

    if (checkbox[0].checked) {
        alfabeto += letrasMaiusculas;
        grupos.push(letrasMaiusculas);
    }

    if (checkbox[1].checked) {
        alfabeto += letrasMinusculas;
        grupos.push(letrasMinusculas);
    }

    if (checkbox[2].checked) {
        alfabeto += numeros;
        grupos.push(numeros);
    }

    if (checkbox[3].checked) {
        alfabeto += simbolos;
        grupos.push(simbolos);
    }

    const evitarAmbiguos = document.querySelector('#evitar-ambiguos').checked;

    if (evitarAmbiguos) {
        alfabeto = alfabeto.replace(/[O0Il1]/g, '');

        grupos = grupos.map(grupo => grupo.replace(/[O0Il1]/g, ''));
        grupos = grupos.filter(grupo => grupo.length > 0);
    }

    if (alfabeto.length === 0) {
        campoSenha.value = '';
        mensagem.textContent = 'Selecione pelo menos uma característica.';
        valorEntropia.textContent = '';
        mensagemForca.textContent = '';
        forcaSenha.className = 'forca';
        return;
    }

    let senha = '';

    for (let i = 0; i < tamanhoSenha; i++) {
        const indice = numeroAleatorio(alfabeto.length);
        senha += alfabeto[indice];
    }

    // Garantindo que cada característica selecionada apareça na senha.
    if (tamanhoSenha >= grupos.length) {
        for (let i = 0; i < grupos.length; i++) {
            const indice = numeroAleatorio(grupos[i].length);
            senha = senha.substring(0, i) +
                grupos[i][indice] +
                senha.substring(i + 1);
        }

        // Embaralhando os caracteres.
        const caracteres = senha.split('');

        for (let i = caracteres.length - 1; i > 0; i--) {
            const j = numeroAleatorio(i + 1);
            [caracteres[i], caracteres[j]] = [caracteres[j], caracteres[i]];
        }

        senha = caracteres.join('');
    }

    campoSenha.value = senha;
    classificaSenha(alfabeto.length);
}

function classificaSenha(tamanhoAlfabeto) {
    const entropia = tamanhoSenha * Math.log2(tamanhoAlfabeto);

    forcaSenha.classList.remove('fraca', 'media', 'forte');

    if (entropia > 57) {
        forcaSenha.classList.add('forte');
        mensagemForca.textContent = 'Senha forte';

    } else if (entropia > 35) {
        forcaSenha.classList.add('media');
        mensagemForca.textContent = 'Senha média';

    } else {
        forcaSenha.classList.add('fraca');
        mensagemForca.textContent = 'Senha fraca';
    }

    const dias = Math.floor(
        Math.pow(2, entropia) / (100e6 * 60 * 60 * 24)
    );

    valorEntropia.textContent =
        'Um computador pode levar até ' +
        dias.toLocaleString('pt-BR') +
        ' dias para descobrir essa senha, em uma estimativa teórica.';
}

async function copiarSenha() {
    if (!campoSenha.value) {
        mensagem.textContent = 'Gere uma senha antes de copiar.';
        return;
    }

    try {
        await navigator.clipboard.writeText(campoSenha.value);
        mensagem.textContent = 'Senha copiada com sucesso!';

    } catch (erro) {
        campoSenha.select();
        document.execCommand('copy');
        mensagem.textContent = 'Senha copiada!';
    }
}

geraSenha();
