// Options
const CLIENT_ID = '404915397791-3t1cmdhvvbpkmi69apbvs7jgbip0ivbq.apps.googleusercontent.com';
const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest"];
const SCOPES = 'https://www.googleapis.com/auth/youtube.readonly';

const authorizeButton = document.getElementById('authorize-button');
const signoutButton = document.getElementById('signout-button');
const content = document.getElementById('content');
const channelForm = document.getElementById('channel-form');
const channelInput = document.getElementById('channel-input');
const videoContainer = document.getElementById('video-container');

const defaultChannel = 'techguyweb';

// Load auth2 library
function handleClientLoad() {
  gapi.load('client:auth2', initClient);
}

// Init API client library and set up sign in listeners
function initClient() {
        gapi.client.init({
          discoveryDocs: DISCOVERY_DOCS,
          clientId: CLIENT_ID,
          scope: SCOPES
        }).then(function () {
          // Listen for sign-in state changes.
          gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

          // Handle the initial sign-in state.
          updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
          authorizeButton.onclick = handleAuthClick;
          signoutButton.onclick = handleSignoutClick;
        });
      }


// Update UI sign in state changes
function updateSigninStatus(isSignedIn) {
  if(isSignedIn) {
    authorizeButton.style.display = 'none';
    signoutButton.style.display = 'block';
    content.style.display = 'block';
    videoContainer.style.display = 'block';
    getChannel(defaultChannel);
  } else {
      authorizeButton.style.display = 'block';
      signoutButton.style.display = 'none';
      content.style.display = 'none';
      videoContainer.style.display = 'none';
    }
  }

  // Handle login
  function handleAuthClick() {
    gapi.auth2.getAuthInstance().signIn();
  }

  // Handle Logout
  function handleSignoutClick() {
    gapi.auth2.getAuthInstance().signOut();
  }

  // Channel search form
  channelForm.addEventListener('submit', e => {
    e.preventDefault();
    const channel = channelInput.value;
    getChannel(channel);
  });


  // Display Channel Info
  function showChannelData(data) {
    const channelData = document.getElementById('channel-data');
    channelData.innerHTML = data;
  }

  // Get channel from api
  function getChannel(channel) {
    gapi.client.youtube.channels.list({
      part: 'snippet,contentDetails,statistics',
      forUsername: channel
    })
      .then(response => {
        console.log(response);
        const channel = response.result.items[0];

        const output = `
          <ul class="collection">
            <li class="collection-item">Title: ${channel.snippet.title}</li>
            <li class="collection-item">ID: ${channel.id}</li>
            <li class="collection-item">Subscribers: ${numberWithCommas(channel.statistics.subscriberCount)}</li>
            <li class="collection-item">Views: ${numberWithCommas(channel.statistics.viewCount)}</li>
            <li class="collection-item">Videos: ${numberWithCommas(channel.statistics.videoCount)}</li>
          </ul>
          <p>${channel.snippet.description}</p>
          <hr>
          <a class="btn grey darken-2" target="_blank" href="https://youtube.com/${channel.snippet.customUrl}">Visit Channel</a>
        `;
        showChannelData(output);

        const playListId = channel.contentDetails.relatedPlaylists.uploads;
        requestVideoPlaylist(playListId);

      })
      .catch(err => alert('No channel by that name!'));
    }

    // Format numbers
    function numberWithCommas (x) {
      return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    function requestVideoPlaylist(playListId) {
      const requestOptions = {
        playListId: playListId,
        part: 'snippet',
        maxResults: 10
      }
      const request = gapi.client.youtube.playlistItems.list(requestOptions);

      request.execute(response => {
        console.log(response);
      });
    }
