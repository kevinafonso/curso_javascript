function tabuada() {
    let mult = document.getElementById('txtr')
    let tab = document.getElementById('seltab')
if (mult.value.length == 0){
    window.alert('Por Favor, digite um número!')
    } else {
        let n = Number(mult.value)
        while (c <=10){
            let item = document.createElement('option')
            item.text = `${n} x ${c} = ${n*c}`
            item.value = `tab${c}`
            tab.appendChild(item)
            c++
        }
    }
    /*
    var res = document.querySelector('div#res')
    let valor = 1
    let v = Number(valor.value)

    if (mult.value.length == 0) { alert ('[ERRO] Faltam dados')
     } else {
        let m = Number(mult.value)

        for ( v <= 10; v ++)
            let resul = m x v
            {
            res.innerHTML = `${m} x ${v} = ${resul}`
        }
     }*/
}