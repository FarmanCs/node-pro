class APIFeaturs {
   constructor(query, queryString) {
      this.query = query
      this.queryString = queryString
   }
   // 1) Filtering of API query
   filter() {
      const queryObject = { ...this.queryString }
      const excludeData = ['page', 'sort', 'limit', 'fields']
      excludeData.forEach(val => delete queryObject[val])
      // 1.1) advance filtrin of query
      let queryString = JSON.stringify(queryObject)
      //make a reguler expression to get $gt $gte $lte $lt (/\b(gte|lte|gt|lt)\b/g)
      queryString = queryString.replace(/\b(gte|lte|gt|lt)\b/g, match => `$${match}`)
      // let query = tourModle.find(JSON.parse(queryString))
      this.query = this.query.find(JSON.parse(queryString))


      return this;
   }
   // 2) Sorting features on API
   sort() {
      if (this.queryString.sort) {
         const sortObj = this.queryString.sort.split(',').join(' ')
         this.query = this.query.sort(sortObj)
         //sort('price', averageRating)
      } else {
         this.query = this.query.sort('-createdAt')
      }
      return this;
   }
   // 3) Limiting features for API
   limiting() {
      if (this.queryString.fields) {
         const fields = this.queryString.fields.split(',').join(' ');
         this.query = this.query.select(fields)
      } else {
         this.query = this.query.select('-__v')
         // query = query.select(['-_id', '-__v'])//working same as qbove
      }
      return this;
   }
   // 4) pagination feature for API
   pagination() {
      const pag = this.queryString.page * 1 || 1
      const limit = this.queryString.limit * 1 || 100
      const skip = (pag - 1) * limit//this will give you the valu to skip it.
      this.query = this.query.skip(skip).limit(limit)
      return this;
   }
}

module.exports = APIFeaturs