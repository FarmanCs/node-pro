import '@babel/polyfill'
import { login, logout } from './login'
import { displayMap } from './map-box'
import { updateSettings, updateData } from './updateSettings'
import { BookTour } from './stripe'

//DOM element 
const mapBox = document.getElementById('map')
const loginFrom = document.querySelector('.form--login')
const logOutBtn = document.querySelector('.nav__el--logout')
const userDataForm = document.querySelector('.form-user-data')
const userPasswordForm = document.querySelector('.form-user-password')
const bookBtn = document.getElementById('book_tour')



//Delegation or condition just for map
if (mapBox) {
   const locations = JSON.parse(mapBox.dataset.locations);
   displayMap(locations)
}

if (loginFrom) {
   loginFrom.addEventListener('submit', e => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      login(email, password);
   });
}

if (logOutBtn) logOutBtn.addEventListener('click', logout)

if (userDataForm)
   userDataForm.addEventListener('submit', e => {
      e.preventDefault();
      const form = new FormData()
      form.append('name', document.getElementById('name').value)
      form.append('email', document.getElementById('email').value)
      form.append('photo', document.getElementById('photo').files[0])
      // console.log(form);


      //the below thing are just to update the name and email
      // const name = document.getElementById('name').value;
      // const email = document.getElementById('email').value;
      // updateData(name, email)
      // updateSettings({ name, email }, 'data')
      updateSettings(form, 'data')//this one is to update the photo with name and email
   })

if (userPasswordForm)
   userPasswordForm.addEventListener('submit', async e => {
      e.preventDefault();

      document.querySelector('.btn--save-password').textContent = 'Updating...'

      const passwordCurrent = document.getElementById('password-current').value;
      const password = document.getElementById('password').value;
      const passwordConfirm = document.getElementById('password-confirm').value;
      await updateSettings({ passwordCurrent, password, passwordConfirm }, 'password')

      document.querySelector('.btn--save-password').textContent = 'Save password'

      document.getElementById('password-current').value = ''
      document.getElementById('password').value = ''
      document.getElementById('password-confirm').value = ''
   })

if (bookBtn)
   bookBtn.addEventListener('click', e => {
      e.target.textContent = 'Processing...'
      const { tourId } = e.target.dataset
      BookTour(tourId)
   })