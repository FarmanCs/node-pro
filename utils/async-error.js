module.exports = fn => {//search more to know about this thing
   return (req, res, next) => {
      fn(req, res, next).catch(next)//must searh on google what is happen here...
   }
}