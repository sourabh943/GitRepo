
document.addEventListener('DOMContentLoaded', function () {
    const repositoriesContainer = document.getElementById('repositories');
    const usernameInput = document.getElementById('username');
    const repositoriesCountSelect = document.getElementById('repositories-count');
    const fetchButton = document.getElementById('fetch-button');
    const prevButton = document.getElementById('prev-button');
    const nextButton = document.getElementById('next-button');
    const pageInfo = document.getElementById('page-info');
    const profileImageContainer = document.getElementById('profile-image-container');
    const profileImage = document.getElementById('profile-image');
    const profileName = document.getElementById('profile-name');
    const profileBio = document.getElementById('profile-bio');
    const profileLocation = document.getElementById('location');
    const profileTwitter = document.getElementById('twitter');
    const profileDetails = document.getElementById('profile-details');
    let currentPage = 1;
    let repositoriesPerPage = parseInt(repositoriesCountSelect.value);

    prevButton.style.display = 'none';
    nextButton.style.display = 'none';
    pageInfo.style.display = 'none';
    profileImageContainer.style.display = 'none';

    fetchButton.addEventListener('click', function () {
        const username = usernameInput.value.trim();

        if (username) {
            currentPage = 1;
            fetchUserData(username);
            fetchRepositories(username);
            prevButton.style.display = 'block';
            nextButton.style.display = 'block';
            pageInfo.style.display = 'block';
            profileImageContainer.style.display = 'block';
        } else {
            alert('Invalid GitHub profile URL');
        }
       
    });
    function searchRepositories() {
        const username = extractUsernameFromLink(usernameInput.value.trim());
        const searchQuery = document.getElementById('searchInput').value.trim();

        
    }
    
    prevButton.addEventListener('click', function () {
        if (currentPage > 1) {
            currentPage--;
            fetchRepositories(parseGitHubProfileUrl(usernameInput.value.trim()));
        }
    });

    nextButton.addEventListener('click', function () {
        currentPage++;
        fetchRepositories(parseGitHubProfileUrl(usernameInput.value.trim()));
    });

    repositoriesCountSelect.addEventListener('change', function () {
        repositoriesPerPage = parseInt(repositoriesCountSelect.value);
        fetchRepositories(parseGitHubProfileUrl(profileUrlInput.value.trim()));
    });
    function extractUsernameFromLink(profileLink) {
       
        const match = profileLink.match(/github\.com\/([^/]+)/i);
        return match ? match[1] : null;
    }
    function fetchRepositories(username) {
        const apiUrl = `https://api.github.com/users/${username}/repos?page=${currentPage}&per_page=${repositoriesPerPage}`;

      
        fetch(apiUrl)
        .then(response => {

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const linkHeader = response.headers.get('Link');
            const links = parseLinkHeader(linkHeader);
            updatePaginationState(links);
            return response.json();
        })
        .then(repositories => {
            renderRepositories(repositories);
        })
        .catch(error => {
            console.error('Error fetching repositories:', error);
            updatePaginationState({});
            repositoriesContainer.innerHTML = '<p>Error fetching repositories.</p>';
        }) 
        

    }
    
    function parseLinkHeader(linkHeader) {
        if (!linkHeader) {
            return {};
        }
    
        const links = {};
        linkHeader.split(',').forEach(link => {
            const [url, rel] = link.split(';').map(part => part.trim());
            const match = url.match(/<(.+)>/);
            if (match) {
                links[rel] = match[1];
            }
        });
    
        return links;
    }
    function fetchUserData(username) {
        const apiUrl = `https://api.github.com/users/${username}`;
        
        fetch(apiUrl)
        .then(response => response.json())
        .then(userData => {
            updateProfile(userData);
        })
        .catch(error => {
            console.error('Error fetching user data:', error);
            clearProfile();
        });
  
    }
    function updateProfile(userData) {
        profileImage.src = userData.avatar_url; 
    
        profileName.textContent = userData.name || 'Name not available'; 
        profileBio.textContent = userData.bio || 'Bio not available'; 
        
        profileLocation.innerHTML = `<img src="map-pin.svg" alt="Map Marker Icon" class="icon">${userData.location || 'Not specified'}`;
        profileTwitter.textContent = `Twitter: ${userData.twitter_username ? `@${userData.twitter_username}` : 'Not specified'}`;
       
      
    }


    function clearProfile() {
        profileImage.src = ''; 
        profileName.textContent = ''; 
        profileBio.textContent = ''; 
    }
    function renderRepositories(repositories) {
        repositoriesContainer.innerHTML = ''; 
        repositories.forEach(repository => {
            const repositoryElement = createRepositoryElement(repository);
            repositoriesContainer.appendChild(repositoryElement);
        })
    }

    function createRepositoryElement(repository) {
        const repositoryElement = document.createElement('div');
        repositoryElement.classList.add('repository');

        const nameElement = document.createElement('h2');
        nameElement.textContent = repository.name;

        const descriptionElement = document.createElement('p');
        descriptionElement.textContent = repository.description || 'No description available.';

        const topicsElement = document.createElement('div');
        topicsElement.classList.add('topics');

        const maxTopics = 4;
        for (let i = 0; i < Math.min(maxTopics, repository.topics.length); i++) {
            const topicButton = document.createElement('button');
            topicButton.classList.add('topic-button');
            topicButton.textContent = repository.topics[i];
            topicsElement.appendChild(topicButton);
        }

        if (repository.topics.length > maxTopics) {
            const remainingTopicsButton = document.createElement('button');
            remainingTopicsButton.classList.add('topic-button');
            remainingTopicsButton.textContent = `+${repository.topics.length - maxTopics}`;
            topicsElement.appendChild(remainingTopicsButton);
        }

        repositoryElement.appendChild(nameElement);
        repositoryElement.appendChild(descriptionElement);
        repositoryElement.appendChild(topicsElement);

        return repositoryElement;
    }

    function parseGitHubProfileUrl(url) {
        const match = url.match(/github\.com\/([^\/]+)/);
        return match ? match[1] : null;
    }

    function updatePaginationState(totalRepositories) {
        const totalPages = Math.ceil(totalRepositories / repositoriesPerPage);
        prevButton.disabled = currentPage === 1;
        nextButton.disabled = currentPage === totalPages;
        pageInfo.textContent = `Page ${currentPage}` ;
    }
    
});
