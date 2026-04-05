import React, {useState, useEffect} from 'react';
import { Authenticator } from '@aws-amplify/ui-react';

//import any API functions or compontents
import ImageGrid from '../components/ImageGrid';
import { fetchImages } from '../services/api';

const GalleryScreen = ({user, signOut}) => {
    //any states can go here; you can think of them like variables :)
    const [loading, setLoading] = useState(true); //set loading to true for when the page first renders
    const [error, setError] = useState(null);
    const [images, setImages] = useState([])

    //any data fetching goes here (e.g. first 20 user images if that is what you want displayed)

    //(the following comment is in the style of java-doc commentation, usually prominent in prod code environments)
    /**
     * To fetch data we always use the useEffect hook.
     * @async use a function within the hook that is async (faster)
     * @structure use a try catch block in case errors are thrown from API function
     * @array there should be a dependancy array at the end of the hoook that basically makes the hook run when changes in the dependancies occur (this is important)
     * */
    
    //Example hook 
    useEffect(() =>{
        //write/define the async helper function...but we still have to call it to run it
        const loadImages = async () => {
            // Check for Demo Mode first
            if (import.meta.env.VITE_DEMO_MODE === 'true') {
                setLoading(false);
                setImages([]); // ImageGrid handles the mock data if this is empty and isDemo is true
                return;
            }

            try
            {
                setLoading(true); //set loading to true so the UI will show "Rendering pictures"
                const result = await fetchImages();
                setImages(result.images || []); //place the data in a state so it can be used throughout the component (you'd have to declare this with the loading state variable)
            } 
            catch (err)
            {
                console.error("Gallery Load Error:", err);
                setError("Issue with the API. Please check your AWS connection.");
            }
            finally //will run after try/catch
            {
                setLoading(false);  //we want to make the UI not show loading text anymore (because it was set to true at page initialization)
            }
        };

        loadImages();
    }, [user]); //change every time the user is changed, if empty the useEffect will only run once (MUST BE THERE IN EVERY CASE)

    //define what the UI will look like in all cases (loading, error, data was fetched)
    
    // Improved error display
    if (error && import.meta.env.VITE_DEMO_MODE !== 'true') {
        return (
            <div className="container mt-5 text-center">
                <div className="alert alert-danger">{error}</div>
                <button className="btn btn-primary" onClick={() => window.location.reload()}>Retry</button>
            </div>
        );
    }
    if(loading) return (
        <div className="text-center mt-5">
            <h4>Syncing with AWS...</h4>
            <ImageGrid loading={true} />
        </div>);
    if (error)  return <div className="alert alert-danger">{error}</div>;

    return (
        <div className="feature-container animate-fade-in">
            <header className="mb-4 d-flex justify-content-between align-items-center">
                <div>
                    <h1>Gallery Page</h1>
                    <p className="text-muted">Explore your cloud-stored images</p>
                </div>
                {/* Adding a refresh button is always a good idea for Cloud Apps */}
                <button 
                    className="btn btn-outline-secondary btn-sm" 
                    onClick={() => window.location.reload()}
                    disabled={loading}
                >
                    {loading ? 'Syncing...' : 'Refresh Gallery'}
                </button>
            </header>

            <section className="content-area">
                {/* Passing both images and loading state ensures the 
                  ImageGrid knows when to show skeletons vs data 
                */}
                <ImageGrid images={images} loading={loading}/>
                
                {!loading && images.length === 0 && import.meta.env.VITE_DEMO_MODE !== 'true' && (
                    <div className="text-center mt-5">
                        <p>No images found. Head over to the Upload tab to add some!</p>
                    </div>
                )}
            </section>
        </div>
    );

}

export default GalleryScreen;