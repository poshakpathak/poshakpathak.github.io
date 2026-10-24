/* Photos app: the albums and pictures it shows.

   To add a photo:
   1. Upload it to this photos/ folder on GitHub (iPhone HEIC is fine).
      A robot then converts it to JPG, shrinks it, removes the location
      data and makes a thumbnail. So always write the name below with .jpg
   2. Add a line for it in an album:
        {file:"name.jpg", caption:"What's happening", place:"City", date:"2025-02"},
      place and date are optional. date is year-month, like "2025-02".

   To add an album, copy one {album:...} block. Albums show in this order,
   so put the newest first. The first photo is the album cover, unless the
   album names one with cover:"name.jpg". */
window.PHOTOS=[
  {album:"Las Vegas",about:"My trip to present at the ITNG 2025 conference.",cover:"vegas-7341.jpg",photos:[
    {file:"vegas-7321.jpg",caption:"The Sphere through the palms",place:"Las Vegas",date:"2025-04"},
    {file:"vegas-7341.jpg",caption:"The Sphere at night",place:"Las Vegas",date:"2025-04"},
    {file:"vegas-7346.jpg",caption:"Bikes parked under the Sphere",place:"Las Vegas",date:"2025-04"},
    {file:"vegas-7347.jpg",caption:"The High Roller",place:"Las Vegas",date:"2025-04"},
    {file:"vegas-7373.jpg",caption:"Inside a High Roller cabin, above the Strip",place:"Las Vegas",date:"2025-04"},
    {file:"vegas-7380.jpg",caption:"Brooklyn Bowl",place:"Las Vegas",date:"2025-04"},
    {file:"vegas-7382.jpg",caption:"Gordon Ramsay Fish & Chips",place:"Las Vegas",date:"2025-04"},
    {file:"vegas-7383.jpg",caption:"Las Vegas Blvd at Caesars Palace",place:"Las Vegas",date:"2025-04"},
    {file:"vegas-7384.jpg",caption:"Caesars Palace from the crosswalk",place:"Las Vegas",date:"2025-04"},
    {file:"vegas-7387.jpg",caption:"The Flamingo",place:"Las Vegas",date:"2025-04"},
    {file:"vegas-7390.jpg",caption:"Playoff basketball at the sportsbook",place:"Las Vegas",date:"2025-04"},
    {file:"vegas-7402.jpg",caption:"Horse fountain, with the Bellagio behind",place:"Las Vegas",date:"2025-04"},
    {file:"vegas-7405.jpg",caption:"The Bellagio from the bridge",place:"Las Vegas",date:"2025-04"},
    {file:"vegas-7412.jpg",caption:"The Eiffel Tower at Paris Las Vegas",place:"Las Vegas",date:"2025-04"},
    {file:"vegas-7427.jpg",caption:"The Strip, late",place:"Las Vegas",date:"2025-04"},
    {file:"vegas-7431.jpg",caption:"The 202 Flamingo bus",place:"Las Vegas",date:"2025-04"},
    {file:"vegas-7438.jpg",caption:"The Bellagio across the lake",place:"Las Vegas",date:"2025-04"},
    {file:"vegas-7457.jpg",caption:"The Strip through the glass",place:"Las Vegas",date:"2025-04"},
    {file:"vegas-7460.jpg",caption:"Late night outside Planet Hollywood",place:"Las Vegas",date:"2025-04"},
  ]},
  {album:"Ballparks",about:"Games I've been to.",photos:[
    {file:"rangers.jpg",caption:"Rangers game at dusk",place:"Globe Life Field, Arlington"},
  ]},
];
