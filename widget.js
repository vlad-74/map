var cssStyle = document.createElement('style');
cssStyle.type = 'text/css';
cssStyle.innerHTML = `
html, body, #map { width: 100%; height: 100%; padding: 0; margin: 0; font-family: Verdana, Arial, Helvetica, sans-serif;} 
p { text-align: center; font-size: 16pt; }
label { width: 100px; font-size: 12pt; }
input { width: 450px; border-radius: 7px; font-size: 11pt; }
textarea { width: 448px; border-radius: 10px;}
.form-group div { display: flex; width: 100%; padding: 5px 0;}
.flex { display: flex;  justify-content: space-between; margin: 25px 10px;}
#divModal { position: absolute; top: 0; width: 100%; height: 100%; z-index: 100; background-color: yellow; opacity: 0.5 }
#spanModal { line-height: 30px; cursor: pointer; color: yellow; position: absolute; top: 10px; right: 10px; width: 30px; height: 30px; border-radius: 50%; z-index: 110; background-color: blue; text-align: center; }
#formModal { position: absolute; top: 100px; left: 35%; top: 25%; width: 600px; height: 400px; padding: 20px; z-index: 300; border-radius: 2%; background-color: LightBlue; }
#exit { background: #3498db; border-radius: 10px; color: #ffffff; font-size: 12pt; padding: 5px 10px; text-decoration: none; cursor: pointer;}
#exit:hover { background: #3cb0fd; text-decoration: none; cursor: pointer; }
#save {background: #d9345d; border-radius: 10px; color: #ffffff; font-size: 12pt;  padding: 5px 10px text-decoration: none; cursor: pointer; }
#save:hover { background: #fc3c73; text-decoration: none; cursor: pointer; }
#save[disabled] { cursor: default; background-color: grey; }
`

document.getElementsByTagName('head')[0].appendChild(cssStyle);

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
            clusterDisableClickZoom: false,
            geoObjectOpenBalloonOnClick: false,
            clusterOpenBalloonOnClick: false
        });

    objectManager.objects.events.add(['click'], onObjectEvent);
    objectManager.clusters.events.add(['click'], onClusterEvent);

    // Чтобы задать опции одиночным объектам и кластерам,
    // обратимся к дочерним коллекциям ObjectManager.
    objectManager.objects.options.set('preset', 'islands#greenDotIcon');
    objectManager.clusters.options.set('preset', 'islands#greenClusterIcons');

    myMap.geoObjects.add(objectManager);

    $.ajax({
        url: './data.json'
    }).done(function(data) {
        objectManager.add(data);
    });

    function onObjectEvent (e) {
        var objectId = e.get('objectId');
        modalWindow(objectId, e.originalEvent.currentTarget._objectsById);
    }
    
    function onClusterEvent (e) {
        var objectId = e.get('objectId');
        if (e.get('type') == 'mouseenter') {
            objectManager.clusters.setClusterOptions(objectId, {
                preset: 'islands#yellowClusterIcons'
            });
        } else {
            objectManager.clusters.setClusterOptions(objectId, {
                preset: 'islands#blueClusterIcons'
            });
        }
    }

    function closeModal () {
        var elements = document.getElementsByClassName('modal');
        while(elements.length > 0){
            elements[0].parentNode.removeChild(elements[0]);
        }
    }

    function unblock () {
        document.getElementById('save').disabled = false;
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
                    linkValue = startArr[key].properties.balloonContentHeader;
                    linkValue = linkValue.length < 90 ? 'Информация об организации' : linkValue;
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

        var dmw = document.createElement('div');
        dmw.id = 'divModal';
        dmw.className = 'modal';
        document.getElementById('map').appendChild(dmw);

        var sp = document.createElement('span');
        sp.id = 'spanModal';
        sp.className = 'modal';
        sp.innerHTML = 'X';
        sp.addEventListener('click', closeModal);
        document.getElementById('map').appendChild(sp);

        var m = document.createElement('div');
        m.id = 'formModal';
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
        <div class='flex'>
            <button id='exit'> Выйти </button> 
            <button disabled id='save'> Сохранить </button>
        </div>
        `
        document.getElementById('map').appendChild(m);

        document.getElementById('exit').addEventListener('click', closeModal);
        document.getElementById('save').addEventListener('click', closeModal);

        let textar = document.getElementsByTagName('textarea'),j=0;
        for (let j = 0; j < textar.length; j++) { 
            textar[j].addEventListener('keydown', unblock);
        }

        let inputs = document.getElementsByTagName('input'),i=0;
        for (let i = 0; i < inputs.length; i++) { 
            inputs[i].addEventListener('keydown', unblock);
        }

    }
}
