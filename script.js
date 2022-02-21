var canvas;
let img;

var imgFloating = function(p) {
    p.preload = function() {
        console.log('preload:' + document.getElementById('imgURL').value);
        preloadedimgURL = document.getElementById('imgURL').value;
        p.img = p.loadImage(preloadedimgURL);
    };

    p.setup = function() {
        p.canvas = p.createCanvas(p.windowWidth,p.windowHeight);
        p.canvas.position(0,0);
        p.canvas.style('z-index','-1');
    
        p.img.resize(360,360);
    };

    p.draw = function() {
        p.image(p.img,0,0, p.width, p.height);
        p.img.filter(p.DILATE);

        if (location.hash === ""){
            p.remove();
            };
    }

    p.windowResized = function() {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
      }
};



// function to contain API requests
const APIController = (() => {


    /*// 

    ENTER CLIENT ID HERE                                          __φ(．．)

    //*/
  const client_id = '';
    /*// 

    ENTER CLIENT SECRET HERE                                          __φ(．．)

    //*/
  const client_secret = '';

  

  // post request to obtain token  
  const getToken = async () => {

      const reqToken = await fetch('https://accounts.spotify.com/api/token', {
          method: 'POST',
          headers: {
              'Content-Type' : 'application/x-www-form-urlencoded',
              'Authorization': 'Basic ' + btoa(client_id + ':' + client_secret)
          },
          body: 'grant_type=client_credentials'
      });

      const actoken = await reqToken.json();
      console.log(actoken.access_token);
      return actoken.access_token;
  };

  // fetch songs in playlist
  const getSongs = async (token, playlistId) => {

      const reqSongs = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks?fields=items(track(name%2Cid))`,{
          method: 'GET',
          headers: { 'Authorization' : 'Bearer ' + token}
      });
  

      const Songs = await reqSongs.json();
      console.log(Songs);
      return Songs;
  };

  // get song details
  const getTrack = async(token, trackID) => {

      const reqTrack = await fetch(`https://api.spotify.com/v1/tracks/${trackID}`, {
          method: 'GET',
          headers: { 'Authorization' : 'Bearer ' + token}
      });

      const Track = await reqTrack.json();
      console.log(Track);
      return Track;
  }

  // calling all the functions and returning them under the name by which we will acess them later in app control
  return {
      Token() {
          return getToken();
      }, 
      Songs(token, playlistId) {
          return getSongs(token, playlistId);
      },
      Track(token, trackID) {
          return getTrack(token,trackID);
      }
  }
})();

// function to link to HTML
const UIController = (() => {

  // object to store ref to html 
  const DOMelements = {
      selectHappy:'#smile',
      selectSad: '#sad',
      selectChill:'#meh',
      hiddentoken: '#hidden_token',
      imgURL:'#imgURL',
      divSong: '#song'   
  }

  // methods
  return {
      
      // store token in hidden form of id hidden_token
      storeToken(value) {
          document.querySelector(DOMelements.hiddentoken).value = value;
      },
      // store url of album art in hidden form of id imgURL
      storeURL(value) {
        document.querySelector(DOMelements.imgURL).value = value;
      },

      // retrieve value stored in hidden token form
      getStoredToken() {
          return {
              token: document.querySelector(DOMelements.hiddentoken).value
          }
      },

      // method to create song detail
      createTrackDetail(img, title, artist, openLink) {

          const songDiv = document.querySelector(DOMelements.divSong);
          // any time user clicks a new song, we need to clear out the song detail div
          songDiv.innerHTML = '';

          // html to input each track detail element
          const html = 
          `
          <div class="child">
            <img id="floatImg" src="${img}" alt="">        
          </div>
          <div class="child">
            <label id='title' for="Genre" class="text">${title}</label>
          </div>
          <div class="child">
            <label id='artist' for="artist" class="text">By ${artist}</label>
          </div> 
          <div class="child">
            <a href='${openLink}'>
                <i id='spotify' class="fab fa-spotify"></i>
            </a>
          </div>
          <button id='back' onclick="window.history.go(-2)">
          ⬅️
          </button>
          `;

            console.log('link is ' + openLink);

            var url_ob = new URL(document.URL);
            url_ob.hash = '#song';

            // new url
            var new_url = url_ob.href;

            // change the current url
            document.location.href = new_url;

          // instantiate p5 sketch 
          var myp5 = new p5(imgFloating);
          console.log('loaded');

          songDiv.insertAdjacentHTML('beforeend', html)
      }
  }
})();


// main function
// app controller i.e. main function, calls both API and UI controller and links them
const APPController = ((UI, API) => {

  // event listener for when button is clicked, print out fragmnet identifier
  window.addEventListener("hashchange", () => {
      if (location.hash === "#1") {

          // toggle HTML elements
          document.getElementById("icon-box").style.display = "none";
          document.getElementById("text-box").style.display = "none";
          document.getElementById("songwrapper").style.display = "flex";
          document.getElementById("song").style.display = "block";

          // fn to generate track id for happy music
          const run = async() => {
              // store token
              const token = await API.Token();
              UI.storeToken(token);


              /*// 

              ENTER PLAYLIST ID HERE                                          __φ(．．)

              //*/
              const playlistID = '';
              

              // get songs in playlist
              const playlistSongs = await API.Songs(token, playlistID);
              // from songs in playlist, select random song id
              const max = playlistSongs.items.length;
              function getRandomInt(max) {
                  max = Math.floor(max);
                  return Math.floor(Math.random() * (max + 1));
              }
              const randomInt = getRandomInt(max);
              const trackId = playlistSongs.items[randomInt].track.id
              // obtain and store track details 
              const trackdetails = await API.Track(token,trackId);
              // store imgURL in hidden form
              const imgURL = await trackdetails.album.images[0].url;
              UI.storeURL(imgURL);
              // pass trackdetails into fn to create song display
              UI.createTrackDetail(trackdetails.album.images[0].url, trackdetails.name, trackdetails.artists[0].name, trackdetails.external_urls.spotify);
          }
          run();

      } else if (location.hash === "#3") {

          // toggle HTML elements
          document.getElementById("icon-box").style.display = "none";
          document.getElementById("text-box").style.display = "none";
          document.getElementById("songwrapper").style.display = "flex";
          document.getElementById("song").style.display = "block";

          // fn to generate track id for SAD music
          const run = async() => {
              const token = await API.Token();
              UI.storeToken(token);


              /*// 

              ENTER PLAYLIST ID HERE                                          __φ(．．)

              //*/
              const playlistID = '';


              const playlistSongs = await API.Songs(token, playlistID);
              const max = playlistSongs.items.length;
              function getRandomInt(max) {
                  max = Math.floor(max);
                  return Math.floor(Math.random() * (max + 1));
              }
              const randomInt = getRandomInt(max);
              const trackId = playlistSongs.items[randomInt].track.id
              const trackdetails = await API.Track(token,trackId);
              const imgURL = await trackdetails.album.images[0].url;
              UI.storeURL(imgURL);
              UI.createTrackDetail(trackdetails.album.images[0].url, trackdetails.name, trackdetails.artists[0].name, trackdetails.external_urls.spotify);
          }
          run();

      } else if (location.hash === "#2") {

          // toggle HTML elements
          document.getElementById("icon-box").style.display = "none";
          document.getElementById("text-box").style.display = "none";
          document.getElementById("songwrapper").style.display = "flex";
          document.getElementById("song").style.display = "block";

          // fn to generate track id for chill music
          const run = async() => {
              const token = await API.Token();
              UI.storeToken(token);


              /*// 

              ENTER PLAYLIST ID HERE                                          __φ(．．)

              //*/
              const playlistID = '';


              const playlistSongs = await API.Songs(token, playlistID);
              const max = playlistSongs.items.length;
              function getRandomInt(max) {
                  max = Math.floor(max);
                  return Math.floor(Math.random() * (max + 1));
              }
              const randomInt = getRandomInt(max);
              const trackId = playlistSongs.items[randomInt].track.id
              const trackdetails = await API.Track(token,trackId);
              const imgURL = await trackdetails.album.images[0].url;
              UI.storeURL(imgURL);
              UI.createTrackDetail(trackdetails.album.images[0].url, trackdetails.name, trackdetails.artists[0].name, trackdetails.external_urls.spotify);
          }
          run();

      } else if (location.hash === "") {
            
            document.getElementById("icon-box").style.display = "block";
            document.getElementById("text-box").style.display = "block";
            document.getElementById("songwrapper").style.display = "none";
            document.getElementById("song").style.display = "none";

            console.log('tick')
      }

  });

  return{
      init() {
          console.log('initialize')
      },
  }

})(UIController,APIController);

APPController.init();





