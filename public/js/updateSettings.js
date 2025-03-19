import axios from "axios"
import { showAlert } from "./alert"
//udpate Only name and email
// export const updateData = async (name, email) => {
//    try {
//       const result = await axios({
//          method: 'PATCH',
//          url: 'http://127.0.0.1:7070/api/v1/users/update-me',
//          data: {
//             name,
//             email
//          }
//       });
//       if (result.data.status === 'succes') {
//          showAlert('success', 'Data updated successfully!')
//       }
//    } catch (error) {
//       showAlert('error', error.response.data.message)
//    }

// }

//it is single function to update the user data, and the password too.
//data is either data or password.
export const updateSettings = async (data, type) => {
   try {
      const url = type === 'password'
         ? 'http://127.0.0.1:7070/api/v1/users/update-Password'
         : 'http://127.0.0.1:7070/api/v1/users/update-me'

      const result = await axios({
         method: 'PATCH',
         url,
         data
      });
      if (result.data.status === 'success') {
         showAlert('success', `${type.toUpperCase()} updated successfully!`)
      }
   } catch (error) {
      showAlert('error', error.response.data.message)
   }
}