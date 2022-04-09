import './index.html';
import ymaps from 'ymaps';
import './css/main.css';
import balloonTemplate from './templates/balloon.hbs';
import reviewTemplate from './templates/review.hbs';

ymaps
  .load(
    'https://api-maps.yandex.ru/2.1/?apikey=5f17399b-969b-4656-9239-07cdc0adb478&lang=ru_RU'
  )
  .then((maps) => {
    const objectManager = new maps.ObjectManager({
      openBalloonOnClick: false,
      clusterize: true,
      clusterDisableClickZoom: true,
      clusterBalloonContentLayout: 'cluster#balloonCarousel',
      clusterOpenBalloonOnClick: true,
      groupByCoordinates: false,
    });
    let currentCoords;

    if (!localStorage.getItem('idCount')) {
      localStorage.setItem('idCount', 0);
    }
    let idCount = localStorage.getItem('idCount');

    if (!localStorage.getItem('reviews')) {
      localStorage.setItem('reviews', JSON.stringify([]));
    }
    const dataReviews = JSON.parse(localStorage.getItem('reviews'));

    if (!localStorage.getItem('objects')) {
      localStorage.setItem(
        'objects',
        JSON.stringify({
          type: 'FeatureCollection',
          features: [],
        })
      );
    }
    const dataObj = JSON.parse(localStorage.getItem('objects'));

    const map = new maps.Map(
      'map',
      {
        center: [55.751574, 37.573856],
        zoom: 12,
        controls: ['zoomControl'],
      },
      {
        balloonMaxWidth: 350,
        balloonMaxHeight: 500,
      }
    );

    map.events.add('click', function (e) {
      if (!map.balloon.isOpen()) {
        currentCoords = e.get('coords');
        openBalloon(balloonTemplate());
      } else {
        map.balloon.close();
      }
    });

    maps.domEvent.manager.group(document).add(['click'], function (event) {
      if (event.get('target').id === 'btnAdd') {
        const formFields = {
          name: document.querySelector('#fieldName'),
          location: document.querySelector('#fieldLocation'),
          review: document.querySelector('#fieldReview'),
        };

        if (isValidForm(formFields)) {
          const currentReview = {
            id: idCount,
            coords: currentCoords,
            name: formFields.name.value,
            location: formFields.location.value,
            review: formFields.review.value,
            date: getCurrentDay(),
          };
          dataReviews.push(currentReview);
          localStorage.setItem('reviews', JSON.stringify(dataReviews));

          const currentPlace = {
            type: 'Feature',
            id: idCount,
            geometry: {
              type: 'Point',
              coordinates: currentCoords,
            },
            properties: {
              balloonContentBody: reviewTemplate({
                name: currentReview.name,
                location: currentReview.location,
                date: currentReview.date,
                review: currentReview.review,
                link: 'review__location_link',
                latitude: currentCoords[0],
                longitude: currentCoords[1],
              }),
            },
          };
          dataObj.features.push(currentPlace);
          localStorage.setItem('objects', JSON.stringify(dataObj));
          renderMap();

          idCount++;
          localStorage.setItem('idCount', idCount);

          map.balloon.close();
        }
      }

      if (event.get('target').classList.contains('review__location_link')) {
        currentCoords = [
          +event.get('target').dataset.latitude,
          +event.get('target').dataset.longitude,
        ];
        const currentReviews = getReviewsByCoords(currentCoords);
        openBalloon(balloonTemplate(currentReviews));
      }
    });

    objectManager.objects.events.add('click', function (e) {
      currentCoords = objectManager.objects.getById(e.get('objectId')).geometry
        .coordinates;
      const currentReviews = getReviewsByCoords(currentCoords);
      openBalloon(balloonTemplate(currentReviews));
    });

    objectManager.clusters.events.add('click', function (e) {
      currentCoords = objectManager.clusters.getById(e.get('objectId')).geometry
        .coordinates;
    });

    window.localStorage.clear();
    renderMap();

    function openBalloon(htmlBalloon) {
      map.balloon.open(currentCoords, {
        contentBody: htmlBalloon,
      });
    }

    function getCurrentDay() {
      const today = new Date();
      const dd = String(today.getDate()).padStart(2, '0');
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const yyyy = today.getFullYear();

      return `${dd}.${mm}.${yyyy}`;
    }

    //не получилось с адресом
    /*
    function getAddress(coords) {
        return new Promise((resolve, reject) => {
              maps.geocode(coords)
                  .then(response => resolve(response.geoObjects.get(0).getAddressLine()))
                  .catch(e => reject(e));
          });
      }
      */

    function getReviewsByCoords(coords) {
      const result = {
        reviews: [],
      };

      dataReviews.forEach(function (review) {
        if (review.coords[0] === coords[0] && review.coords[1] === coords[1]) {
          result.reviews.push(review);
        }
      });

      return result;
    }

    function renderMap() {
      objectManager.add(dataObj);
      map.geoObjects.add(objectManager);
    }

    function isValidForm(fieldsObj) {
      let result = true;

      for (const fieldName in fieldsObj) {
        const errorClassName = 'is-error';
        const field = fieldsObj[fieldName];
        let val = field.value;
        val = val.trim();

        if (val === '') {
          field.classList.add(errorClassName);
          result = false;
        } else if (field.classList.contains(errorClassName)) {
          field.classList.remove(errorClassName);
        }
      }

      return result;
    }
  })
  .catch((error) => console.log('Failed to load Yandex Maps', error));
