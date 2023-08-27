function contar() {
    let ini = document.getElementById('txtini')
    let fim = document.getElementById('txtfim')
    let pass = document.getElementById('txtpas')

    if (ini.value.length == 0 || fim.value.length == 0 || pass.value.length == 0) {
        alert('[ERRO] Faltam dados!')
    } else {
        res.innerHTML = 'Contando: '
        let i = Number(ini.value)
        let f = Number(fim.value)
        let p = Number(pass.value)

        for (let c = i; c <= f; c += p){
            res.innerHTML += `${c} \u{1F449}`
        }
        res.innerHTML += `\u{1F3C1}`
    }

}



/*console.log('contando:')
    do{
        console.log(`${resul}`)
        resul =+ pass
    } while (resul <= fim)

console.log('FIM!')

cont.style.textAlign = 'center'
 cont.innerHTML = `${resul}`
}*/