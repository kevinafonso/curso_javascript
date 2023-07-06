var msg = window.document.getElementById ('msg')
var img = window.document.getElementById ('imagem')
var data = new Date()
//var hora = data.getHours()
hora = 12
msg.innerHTML = `Agora são ${hora} horas.`
if (hora >= 0 && hora < 12){
    //Bom Dia!
    img.src = 'imagens/manha.png'
} else if (hora >= 12 && hora < 18) {
    //Boa Tarde!
    img.src = 'imagens/amanhecer.png'
} else {
    // Boa Noite!
    img.src = 'imagens/noite.png'
}