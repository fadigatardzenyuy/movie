// ===================================================================
// PASTE YOUR TMDB API KEY HERE
// ===================================================================
const apiKey = 'b4be9824be50a7cd89782de93d630eab';
// ===================================================================

const imageBaseURL = 'https://image.tmdb.org/t/p/w500';

document.addEventListener('DOMContentLoaded', () => {

    // --- Get references to all needed HTML elements ---
    const movieGrid = document.getElementById('movie-grid');
    const movieDetailsContainer = document.getElementById('movie-details-container');
    const searchButton = document.getElementById('search-button');
    const searchInput = document.getElementById('search-input');
    const loader = document.getElementById('loader');
    const moviesHeader = document.getElementById('movies-header');

    // --- Helper functions for showing/hiding the loader ---
    const showLoader = () => { if (loader) loader.style.display = 'block'; };
    const hideLoader = () => { if (loader) loader.style.display = 'none'; };

    // --- Function to fetch and display a list of movies (for the main page) ---
    const renderMovies = async (url, headerText) => {
        if (!movieGrid) return; // Only run on the main page

        showLoader();
        movieGrid.innerHTML = '';
        if (moviesHeader) moviesHeader.textContent = headerText;

        try {
            const response = await fetch(url);
            const data = await response.json();[7]

            if (data.results && data.results.length > 0) {
                data.results.forEach(movie => {
                    if (!movie.poster_path) return; // Skip movies without a poster

                    const movieCard = document.createElement('div');
                    movieCard.classList.add('movie-card');

                    movieCard.innerHTML = `
                        <img src="${imageBaseURL}${movie.poster_path}" alt="${movie.title}">
                        <div class="movie-info"><h3>${movie.title}</h3></div>
                    `;

                    movieCard.addEventListener('click', () => {
                        window.location.href = `page/movie.html?id=${movie.id}`;
                    });
                    movieGrid.appendChild(movieCard);
                });
            } else {
                movieGrid.innerHTML = '<p class="error-message">No movies found.</p>';
            }
        } catch (error) {
            console.error("Error fetching movies:", error);
            movieGrid.innerHTML = '<p class="error-message">Could not fetch movies. Check your API key or network.</p>';
        } finally {
            hideLoader();
        }
    };

    // --- Function to fetch and display details for a single movie (for the details page) ---
    const displayMovieDetails = async () => {
        if (!movieDetailsContainer) return; // Only run on the details page

        showLoader();
        const urlParams = new URLSearchParams(window.location.search);
        const movieId = urlParams.get('id');

        if (!movieId) {
            movieDetailsContainer.innerHTML = '<p class="error-message">Movie ID not found.</p>';
            hideLoader();
            return;
        }

        try {
            const response = await fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}&append_to_response=credits`);
            const movie = await response.json();

            const director = movie.credits?.crew.find(person => person.job === 'Director');
            const posterSrc = movie.poster_path ? `${imageBaseURL}${movie.poster_path}` : 'https://via.placeholder.com/300x450?text=No+Image';

            movieDetailsContainer.innerHTML = `
                <img src="${posterSrc}" alt="${movie.title}">
                <div class="details-content">
                    <h2>${movie.title}</h2>
                    <p class="tagline">${movie.tagline || ''}</p>
                    <h3>Overview</h3>
                    <p>${movie.overview}</p>
                    <p><strong>Release Date:</strong> ${movie.release_date}</p>
                    <p><strong>Rating:</strong> ${movie.vote_average.toFixed(1)} / 10</p>
                    <p><strong>Director:</strong> ${director ? director.name : 'N/A'}</p>
                </div>
            `;
        } catch (error) {
            console.error("Error fetching movie details:", error);
            movieDetailsContainer.innerHTML = '<p class="error-message">Could not fetch movie details.</p>';
        } finally {
            hideLoader();
        }
    };

    // --- Logic to run based on which page is currently loaded ---

    // If we are on the main page (index.html)
    if (movieGrid) {
        // Load popular movies by default
        const popularMoviesURL = `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}`;
        renderMovies(popularMoviesURL, 'Popular Movies');

        // Set up the search functionality
        searchButton.addEventListener('click', () => {
            const query = searchInput.value.trim();
            if (query) {
                const searchURL = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(query)}`;
                renderMovies(searchURL, `Results for "${query}"`);
            }
        });
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') searchButton.click();
        });
    }

    // If we are on the details page (movie.html)
    if (movieDetailsContainer) {
        displayMovieDetails();
    }
});