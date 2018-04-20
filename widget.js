var tag_css = document.createElement('style');
tag_css.type = 'text/css';
tag_css.innerHTML = `
p {
    text-align: center;
    font-family: Verdana, Arial, Helvetica, sans-serif; 
    font-size: 16pt; 
}

label {
    width: 100px;
    font-family: Verdana, Arial, Helvetica, sans-serif; 
    font-size: 12pt; 
}

input {
    width: 450px;
    border-radius: 10px;
    font-family: Verdana, Arial, Helvetica, sans-serif; 
    font-size: 11pt; 
}

textarea {
    width: 448px;
    border-radius: 10px;
}

html, body, #map { width: 100%; height: 100%; padding: 0; margin: 0;} 
.form-group div { display: flex; width: 100%; padding: 5px 0;} 

`
document.getElementsByTagName('head')[0].appendChild(tag_css);

var s2 = document.createElement('script');
s2.type = 'text/javascript';
s2.async = false;
s2.src =  'https://api-maps.yandex.ru/2.1/?lang=ru-RU';
document.getElementsByTagName('head')[0].appendChild(s2);

var s = document.createElement('script');
s.type = 'text/javascript';
s.async = false;
s.src =  'https://yandex.st/jquery/2.2.3/jquery.min.js';
document.getElementsByTagName('head')[0].appendChild(s);

setTimeout(() => {
  ymaps.ready(init);
}, 500);

function init () {
    var myMap = new ymaps.Map('map', {
            center: [55.76, 37.64],
            zoom: 10
        }, {
            searchControlProvider: 'yandex#search'
        }),
        objectManager = new ymaps.ObjectManager({
            // Чтобы метки начали кластеризоваться, выставляем опцию.
            clusterize: true,
            // ObjectManager принимает те же опции, что и кластеризатор.
            gridSize: 32,
            clusterDisableClickZoom: true,
            geoObjectOpenBalloonOnClick: false,
            clusterOpenBalloonOnClick: false
        });

    // Чтобы задать опции одиночным объектам и кластерам,
    // обратимся к дочерним коллекциям ObjectManager.
    objectManager.objects.options.set('preset', 'islands#greenDotIcon');
    objectManager.clusters.options.set('preset', 'islands#greenClusterIcons');
    myMap.geoObjects.add(objectManager);

    $.ajax({
        url: './data.json'
    }).done(function(data) {
        console.log('data', data);
        objectManager.add(data);
    });

    function onObjectEvent (e) {
        var objectId = e.get('objectId');
        modalWindow(objectId, e.originalEvent.currentTarget._objectsById);
    }
    
    function onClusterEvent (e) {
        var objectId = e.get('objectId');
        modalWindow(objectId);
    }

    function closeModal () {
        var elements = document.getElementsByClassName('modal');
        while(elements.length > 0){
            elements[0].parentNode.removeChild(elements[0]);
        }
    }

    function modalWindow (obj, startArr) {
        var linkValue;
        var nameValue;
        var adresValue;
        var descValue;
        var telValue;
        Object.keys(startArr).map(
            key => {
                if (key === obj + '') {
                    linkValue = startArr[key].properties.balloonContentHeader
                    var str = startArr[key].properties.balloonContentBody;
                    var res = str.split('</div>');
                    for (let i = 0; i < res.length; i++) {
                        switch (i) {
                            case 0:
                                nameValue = res[i] + '</div>';
                                break;
                            case 1:
                                adresValue = res[i] + '</div>';
                                break;
                            case 2:
                                descValue = res[i] + '</div>';
                                break;
                            case 3:
                                telValue = res[i] + '</div>';
                                break;
                        }   
                    }
                }
            }
          );

        var sp = document.createElement('span');
        sp.className = 'modal';
        sp.innerHTML = 'X';
        sp.style.textAlign = 'center';
        sp.style.lineHeight = '30px';
        sp.style.cursor = 'pointer';
        sp.style.color = 'yellow';
        sp.style.position = 'absolute';
        sp.style.top = '10px';
        sp.style.right = '10px';
        sp.style.width = '30px';
        sp.style.height = '30px';
        sp.style.borderRadius = '50%';
        sp.style.zIndex = '110';
        sp.style.backgroundColor = 'blue';
        sp.addEventListener('click', closeModal);
        document.getElementById('map').appendChild(sp);

        var dmw = document.createElement('div');
        dmw.className = 'modal';
        dmw.style.position = 'absolute';
        dmw.style.top = '0';
        dmw.style.width = '100%';
        dmw.style.height = '100%';
        dmw.style.zIndex = '100';
        dmw.style.backgroundColor = 'yellow';
        dmw.style.opacity = '0.5';
        document.getElementById('map').appendChild(dmw);

        var m = document.createElement('div');
        m.className = 'modal';
        m.innerHTML = `
        
        <p> ${linkValue || ''} </p>

        <div class='form-group'>
            ${nameValue || ''} 
        </div>
        <div class='form-group'>
            ${adresValue || ''} 
        </div>
        <div class='form-group'>
        ${descValue || ''} 
        </div>
        <div class='form-group'>
            ${telValue || ''} 
        </div>
        `

        m.style.position = 'absolute';
        m.style.top = '100px';
        m.style.left = '35%';
        m.style.width = '600px';
        m.style.height = '350px';
        m.style.padding = '20px';
        m.style.zIndex = '300';
        m.style.borderRadius = '2%';
        m.style.backgroundColor = 'LightBlue';
        document.getElementById('map').appendChild(m);

        console.log('onObjectEvent ', obj);

    }

    objectManager.objects.events.add(['click'], onObjectEvent);
    objectManager.clusters.events.add(['click'], onClusterEvent);
}
