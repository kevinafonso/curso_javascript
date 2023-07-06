function verificar(){
    var data = new Date()
    var ano = data.getFullYear()
    var fano = document.getElementById('txtano')
    var res = document.querySelector('div#res')
    if (fano.value.length == 0 || fano.value > ano) {
         window.alert('[ERRO] Verifique os dados e tente novamente!')
    } else {
        var fsex = document.getElementsByName('radsex')
        var idade = ano - Number(fano.value)
        var gênero = ''
        var img = document.createElement('img')
        img.setAttribute('id','foto')
       if (fsex[0].checked){
        gênero = 'Homem'
        if(idade >=0 && idade < 2) {
            //bebe
            img.setAttribute('src', 'bebe-h.png')
        } else if (idade < 10){
            //criança
            img.setAttribute('src', 'crianca-h.png')
        } else if (idade < 21) {
            //adolescente
            img.setAttribute('src', 'adolescente-h.png')
        } else if (idade < 35){
            //adulto  
            img.setAttribute('src', 'adulto-h.png')
        } else if ( idade < 50){
            //maduro            
            img.setAttribute('src', 'maduro-h.png')
        } else {
            // Idoso
            img.setAttribute('src', 'idoso-h.png')
        }
       } else if (fsex[1].checked) {
        gênero = 'Mulher'
        if(idade >=0 && idade < 2) {
            //bebe
            img.setAttribute('src', 'bebe-m.png')
        } else if (idade < 10){
            //criança
            img.setAttribute('src', 'crianca-m.png')
        } else if (idade < 21) {
            //adolescente
            img.setAttribute('src', 'adolescente-m.png')
        } else if (idade < 35){
            //adulto  
            img.setAttribute('src', 'adulto-m.png')
        } else if ( idade < 50){
            //maduro            
            img.setAttribute('src', 'maduro-m.png')
        } else {
            // Idoso
            img.setAttribute('src', 'idoso-m.png')
        }
       }
       res.style.textAlign = 'center'
        res.innerHTML = `Você é um(a) ${gênero} com ${idade} anos.`
       res.appendChild(img)
    }
}