/* Photos app: the albums and pictures it shows.

   To add a photo:
   1. Upload it to this photos/ folder on GitHub (iPhone HEIC is fine).
      A robot then converts it to JPG, shrinks it, removes the location
      data and makes a thumbnail. So always write the name below with .jpg
   2. Add a line for it in an album:
        {file:"name.jpg", caption:"What's happening", place:"City", date:"2025-02"},
      place and date are optional. date is year-month, like "2025-02".

   To add an album, copy one {album:...} block. Albums show in this order,
   so put the newest first. The first photo is the album cover. */
window.PHOTOS=[
  {album:"Ballparks",about:"Games I've been to.",photos:[
    {file:"rangers.jpg",caption:"Rangers game at dusk",place:"Globe Life Field, Arlington"},
  ]},
];
