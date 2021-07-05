'use strict';


class Workout {
  date = new Date();
  id = Date.now() + '';
  clicks = 0;

  constructor(coords, distance, duration) {
    // this.date = ...
    // this.id = ...
    this.coords = coords; // [lat, lng]
    this.distance = distance; // in km
    this.duration = duration; // in min
  }

  _setDescription() {
    // prettier-ignore
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
      months[this.date.getMonth()]
    } ${this.date.getDate()}`;
  }

  click() {
    this.clicks++;
  }
}

class Running extends Workout {
  type = 'running';

  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace();
    this._setDescription();
  }

  calcPace() {
    // min/km
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}

class Cycling extends Workout {
  type = 'cycling';

  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    // this.type = 'cycling';
    this.elevationGain = elevationGain;
    this.calcSpeed();
    this._setDescription();
  }

  calcSpeed() {
    // km/h
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}

///////////////////////////////////////
// APPLICATION ARCHITECTURE

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');
const allDelete = document.querySelector('.button__clear');
const modalCloseBg = document.querySelector('.bg-modal')
const modalCloseBtn = document.querySelector('.btn__close')
const modalOkBtn = document.querySelector('.btn__ok')
const inputTypeFilter = document.querySelector('.filter__input--type');
const inputTypeSort = document.querySelector('.sort__input--type');

class App {
  #map;
  #mapEvent;
  #workouts = [];
  #mapZoomLevel = 13;
  #idChange = null;

  constructor() {
    this._getPosition();

    this._getLocalStorage();

    form.addEventListener('submit', this._handleSubmit.bind(this));

    inputType.addEventListener('change', this._toggleElevationField);

    containerWorkouts.addEventListener('click', this._moveToPopup.bind(this));

    containerWorkouts.addEventListener('click', this._handleDeleteWorkout.bind(this));

    containerWorkouts.addEventListener('click', this._handleOpenChange.bind(this));

    allDelete.addEventListener('click', this._handleAllDelete.bind(this));

    modalCloseBg.addEventListener('click', this._closeModal.bind(this));
    
    modalCloseBtn.addEventListener('click', this._closeModal.bind(this));

    inputTypeFilter.addEventListener('change', this._filterWorkout.bind(this))

    inputTypeSort.addEventListener('change', this._sortWorkout.bind(this))

  }

  _getPosition() {
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(this._loadMap.bind(this), () =>
        alert('Could not get your position')
      );
  }

  _loadMap(position) {
    const { latitude } = position.coords;
    const { longitude } = position.coords;

    const coords = [latitude, longitude];

    this.#map = L.map('map').setView(coords, this.#mapZoomLevel);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    //handling cliks on map
    this.#map.on('click', this._showForm.bind(this));

    this.#workouts.forEach(work => {
      this._renderWorkoutMarker(work);
    });
  }

  _showForm(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove('hidden');
    inputDistance.focus();
  }

  _hideForm() {
    // Empty inputs
    inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElevation.value =
        '';

    form.style.display = 'none';
    form.classList.add('hidden');
    setTimeout(() => (form.style.display = 'grid'), 1000);
  }

  _toggleElevationField() {
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }

  _handleSubmit(e) {
    e.preventDefault();
    if( this.#idChange ) {
      this._handleClickChange();
      this._getLocalStorage();
      this.#idChange = ''
    } else {
      this._newWorkout();
    }
  }

  _newWorkout() {
    const validInputs = (...inputs) =>
      inputs.every(inp => Number.isFinite(inp));
    const allPositive = (...inputs) => inputs.every(inp => inp > 0);


    // Get data from form
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const { lat, lng } = this.#mapEvent.latlng;
    let workout;

    // If workout running, create running object
    if (type === 'running') {
      const cadence = +inputCadence.value;

      // Check if data is valid
      if (
        // !Number.isFinite(distance) ||
        // !Number.isFinite(duration) ||
        // !Number.isFinite(cadence)
        !validInputs(distance, duration, cadence) ||
        !allPositive(distance, duration, cadence)
      )
        return alert('Inputs have to be positive numbers!');

      workout = new Running([lat, lng], distance, duration, cadence);
    }

    // If workout cycling, create cycling object
    if (type === 'cycling') {
      const elevation = +inputElevation.value;

      if (
        !validInputs(distance, duration, elevation) ||
        !allPositive(distance, duration)
      )
        return alert('Inputs have to be positive numbers!');

      workout = new Cycling([lat, lng], distance, duration, elevation);
    }

    // Add new object to workout array
    this.#workouts.push(workout);

    // Render workout on map as marker
    this._renderWorkoutMarker(workout);

    // Render workout on list
    this._renderWorkout(workout);

    // Hide form + clear input fields
    this._hideForm();

    // Set local storage to all workouts
    this._setLocalStorage(this.#workouts);
  }

  _renderWorkoutMarker(workout) {
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(
        `${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'} ${workout.description}`
      )
      .openPopup();
  }

  _renderWorkout(workout) {
    let html = `
      <li class="workout workout--${workout.type}" data-id="${workout.id}">
        <div class="workout__icon-remove">🗑️</div>
        <div class="workout__icon-change">✏️</div>
        <h2 class="workout__title">${workout.description}</h2>
        <div class="workout__details">
          <span class="workout__icon">${
            workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'
          }</span>
          <span class="workout__value">${workout.distance}</span>
          <span class="workout__unit">km</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">⏱</span>
          <span class="workout__value">${workout.duration}</span>
          <span class="workout__unit">min</span>
        </div>
    `;

    if (workout.type === 'running')
      html += `
        <div class="workout__details">
          <span class="workout__icon">⚡️</span>
          <span class="workout__value">${workout.pace.toFixed(1)}</span>
          <span class="workout__unit">min/km</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">🦶🏼</span>
          <span class="workout__value">${workout.cadence}</span>
          <span class="workout__unit">spm</span>
        </div>
      </li>
      `;

    if (workout.type === 'cycling')
      html += `
        <div class="workout__details">
          <span class="workout__icon">⚡️</span>
          <span class="workout__value">${workout.speed.toFixed(1)}</span>
          <span class="workout__unit">km/h</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">⛰</span>
          <span class="workout__value">${workout.elevationGain}</span>
          <span class="workout__unit">m</span>
        </div>
      </li>
      `;

    form.insertAdjacentHTML('afterend', html);
  }

  _moveToPopup(e) {
    const workoutEl = e.target.closest('.workout');

    if (!workoutEl) return;

    const workout = this.#workouts.find(w => w.id === workoutEl.dataset.id);
    this.#map.setView(workout.coords, this.#mapZoomLevel, {
      animate: true,
      pan: {
        duration: 1,
      },
    });

    // using the public interface
    // workout.click();
  }

  _handleDeleteWorkout (e) {
    const deleteEl = e.target.closest('.workout__icon-remove');
    if (!deleteEl) return;
    this._openModal('Are you sure you want to delete?')
    modalOkBtn.addEventListener('click', () => {
      this.#workouts = this.#workouts.filter(w => w.id !== deleteEl.parentNode.dataset.id)
      containerWorkouts.removeChild(deleteEl.parentNode)
      this._setLocalStorage(this.#workouts);
      // this._editWorkoutHelper(
      //   '.leaflet-marker-icon',
      //   '.leaflet-popup',
      //   '.leaflet-marker-shadow'
      // );
      // this.#workouts.forEach(work => {
      //   this._renderWorkoutMarker(work);
      // });
      this._renderFunctionMarker(this.#workouts)
      modalCloseBg.style.display = "none";
    }, { once: true })
  }

  _handleAllDelete () {
    const workoutElAll = document.querySelectorAll('.workout');
    if (!this.#workouts.length !== 0) return;
    this._openModal('Are you sure you want to delete all workout?')
    modalOkBtn.addEventListener('click', () => { 
        workoutElAll.forEach( el => el.remove() );
        this.#workouts.length = 0;
        this._setLocalStorage(this.#workouts);
        this._editWorkoutHelper(
          '.leaflet-marker-icon',
          '.leaflet-popup',
          '.leaflet-marker-shadow'
        );
        modalCloseBg.style.display = "none";
    }, { once: true })
  }

  _handleOpenChange (e) {
    const changeEl = e.target.closest('.workout__icon-change');
    if (!changeEl) return
    this._showForm();
    const workout = this.#workouts.find(w => w.id === changeEl.parentNode.dataset.id);
    inputDistance.value = workout.distance
    inputType.value = workout.type
    inputDuration.value = workout.duration
    if (workout.type === 'running') {
      inputElevation.closest('.form__row').classList.add('form__row--hidden');
      inputCadence.closest('.form__row').classList.remove('form__row--hidden');
      inputCadence.value = workout.cadence;
    }
  
    if (workout.type === 'cycling') {
      inputElevation.closest('.form__row').classList.remove('form__row--hidden');
      inputCadence.closest('.form__row').classList.add('form__row--hidden');
      inputElevation.value = workout.elevationGain;
    }
    this.#idChange = workout.id
  }

  _handleClickChange () {
    const workout = this.#workouts.find(w => w.id === this.#idChange);
    const newDescription = workout.description.split(' ')
    newDescription[0] = `${inputType.value[0].toUpperCase()}${inputType.value.slice(1)}`
    workout.description = newDescription.join(' ');
    workout.type = inputType.value;
    workout.distance = +inputDistance.value
    workout.duration = +inputDuration.value
    if ( workout.type === 'cycling' ) {
      workout.elevationGain = +inputElevation.value;
      workout.speed = workout.distance / (workout.duration / 60);
    }else{
      workout.cadence = +inputCadence.value;
      workout.pace = workout.duration / workout.distance;
    }
    let edit = this.#workouts.map( el => {
      if (el.id === this.#idChange) {
       el = workout
      }
      return el
    })
    this._setLocalStorage(edit);
    this._hideForm();
  }

  _editWorkoutHelper(...args) {
    args.forEach(elSelector => {
      const arr = document.querySelectorAll(elSelector);
      arr.forEach(el => el.remove());
    });
  }


  _setLocalStorage( arr ) {
    localStorage.setItem('workouts', JSON.stringify(arr));
  }

  _getLocalStorage() {
    const data = JSON.parse(localStorage.getItem('workouts'));

    if (!data) return;

    this.#workouts = data;

    // this._editWorkoutHelper('.workout');

    // this.#workouts.forEach(work => {
    //   this._renderWorkout(work);
    // });
    this._renderFunctionWorkaut(this.#workouts);
  }

  _renderFunctionWorkaut (arr) {
    this._editWorkoutHelper('.workout');
    arr.forEach(work => {
      this._renderWorkout(work);
    });
  }

  _renderFunctionMarker (arr) {
    this._editWorkoutHelper(
      '.leaflet-marker-icon',
      '.leaflet-popup',
      '.leaflet-marker-shadow'
    );
    arr.forEach(work => {
      this._renderWorkoutMarker(work);
    });
  }

  _closeModal(e) {
    if (e.target === modalCloseBg || e.target === modalCloseBtn) {
      modalCloseBg.style.display = "none";
    }
  }

  _openModal(text) {
    let textModal = document.querySelector(".modal-text")
    modalCloseBg.style.display = "flex";
    textModal.textContent = text
  }

  _filterWorkout () {
    const filter = inputTypeFilter.value;
    const data = JSON.parse(localStorage.getItem("workouts"))
    const textFilter = document.querySelector(".filter__text")
    switch (filter) {
      case 'cycling':
        const filterCycling = data.filter(item => item.type !== 'running');
        textFilter.textContent = filter
        this._renderFunctionMarker(filterCycling)
        this._renderFunctionWorkaut(filterCycling)
        break;
      case 'running':
        const filterRunning = data.filter(item => item.type !== 'cycling');
        textFilter.textContent = filter
        this._renderFunctionMarker(filterRunning)
        this._renderFunctionWorkaut(filterRunning)
        break;
      default:
        this._renderFunctionMarker(data)
        this._renderFunctionWorkaut(data)
        textFilter.textContent = 'All'
    }
  }

  _sortWorkout () {
    const sort = inputTypeSort.value;
    const data = JSON.parse(localStorage.getItem("workouts"))
    const textSort = document.querySelector(".sort__text")
    switch (sort) {
      case 'distance':
        const sortDistance = data.sort(function(a, b){
          return b.distance - a.distance
        })
        textSort.textContent = sort
        this._renderFunctionWorkaut(sortDistance)
        break;
      case 'duration':
        const sortDuration = data.sort(function(a, b){
          return b.duration - a.duration
        })
        textSort.textContent = sort
        this._renderFunctionWorkaut(sortDuration)
        break;
      case 'date':
        const sortDate = data.sort(function(a, b){
          let dateA = new Date(a.date), dateB = new Date(b.date)
          return dateB - dateA 
        })
        textSort.textContent = sort
        this._renderFunctionWorkaut(sortDate)
        break;
      default:
        textSort.textContent = sort
        this._renderFunctionWorkaut(data)
    }
  }
}

const app = new App();
