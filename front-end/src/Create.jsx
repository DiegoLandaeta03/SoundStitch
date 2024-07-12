import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Box, Input, FormControl, Heading, Button, Text } from '@chakra-ui/react';
import Navbar from './Navbar';
import Song from './Song';
import CustomName from './CustomName';

function Create() {
    const params = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const username = params.username;
    const [searchOptions, setSearchOptions] = useState([]);
    const [currentStitchSongs, setCurrentStitchSongs] = useState([]);
    const [currentAudio, setCurrentAudio] = useState(null);
    const stitchId = location.state.stitchId;
    const [deleteId, setDeleteId] = useState('');


    const handleSearch = (event) => {
        const song = event.target.value;

        if (!song) {
            setSearchOptions([]);
            return;
        }

        searchSongs(song);
    }

    const searchSongs = async (song) => {
        try {
            const access_token = localStorage.getItem('access_token');
            const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(song)}&type=track`, {
                headers: {
                    'Authorization': `Bearer ${access_token}`
                }
            });
            const searchData = await response.json();
            setSearchOptions(searchData.tracks.items);
        } catch (error) {
            console.error(error);
        }
    };

    const handlePlay = (audioElement) => {
        if (currentAudio && currentAudio !== audioElement) {
            currentAudio.pause();
            currentAudio.currentTime = 0;
        }
        setCurrentAudio(audioElement);
    };

    const updateImage = async (imageUrl) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_ADDRESS}/stitch/image`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ stitchId, imageUrl })
            });
        } catch (error) {
            console.error('Error updating stitch:', error);
        }
    };

    const handleAdd = (track) => {
        const { uri, name, artists, album, duration_ms, preview_url, popularity } = track;

        try {
            fetch(`${import.meta.env.VITE_BACKEND_ADDRESS}/song/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    stitchId: stitchId,
                    uri,
                    name,
                    artists,
                    album,
                    duration_ms,
                    preview_url,
                    popularity
                })
            })
                .then(response => response.json())
                .then(data => {
                    getStitchSongs();
                })
                .catch(error => {
                    console.error('Error creating new song:', error);
                });
        } catch (error) {
            console.error('Error creating new stitch:', error);
        }
    }

    const getStitchSongs = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_ADDRESS}/song/${stitchId}`);
            const stitchSongs = await response.json();
            if (stitchSongs.length != 0) {
                const topSongImage = stitchSongs[0].album.images[0].url
                updateImage(topSongImage)
            }
            setCurrentStitchSongs(stitchSongs);
        } catch (error) {
            console.error('Error getting songs in stitch:', error);
        }

    }

    const handleRemove = (songId) => {
        setDeleteId(songId);
    };

    const finalizeStitch = () => {
        navigate(`/${username}`);
    };

    useEffect(() => {
        if (deleteId) {
            fetch(`${import.meta.env.VITE_BACKEND_ADDRESS}/song/${deleteId}`, {
                method: "DELETE",
            })
                .then(response => {
                    if (response.ok) {
                        setDeleteId('');
                        getStitchSongs();
                    } else {
                        throw new Error('Failed to delete song');
                    }
                })
                .catch(error => console.error('Error deleting song:', error));
        } else {
            getStitchSongs();
        }
    }, [deleteId, stitchId]);

    return (
        <div className='Create'>
            <header>
                <Navbar username={username} page={"create"} />
            </header>
            <main>
                <Box display="flex" justifyContent="center" textAlign="center" mt="1em">
                    <CustomName stitchId={stitchId} />
                </Box>
                <Box width="100%" display="flex" justifyContent="space-evenly">
                    <Box className="searchSection" color="white" minHeight="100vh" display="flex" flexDirection="column" alignItems="center" flex="1" mt="2em">
                        <Heading as='h3' size='xl'>Add Songs</Heading>
                        <Box textAlign="center" mb={4}>
                            <FormControl mt="1em">
                                <Input
                                    type='text'
                                    onChange={handleSearch}
                                    placeholder='Search for songs...'
                                    focusBorderColor='rgb(83, 41, 140)'
                                />
                            </FormControl>
                        </Box>

                        <Box width='30em'>
                            {searchOptions.slice(0, 3).map((track) => (
                                <Song
                                    key={track.id}
                                    track={track}
                                    onPlay={handlePlay}
                                    location="addSongs"
                                    onAdd={() => handleAdd(track)}
                                />
                            ))}
                        </Box>
                    </Box>
                    <Box mt="2em">
                        <Button
                            className="finalizeStitch"
                            bgGradient="linear(to-r, rgba(115, 41, 123, 0.9), rgb(83, 41, 140, 0.9))"
                            color="white"
                            width="10em"
                            _focus={{ boxShadow: 'none', bg: 'white', color: 'black' }}
                            _active={{ boxShadow: 'none' }}
                            _hover={{
                                opacity: 1,
                                backgroundSize: 'auto',
                                boxShadow: '0 0 20px -2px rgba(195, 111, 199, .5)',
                                transform: 'translate3d(0, -0.5px, 0) scale(1.01)',
                            }}
                            onClick={finalizeStitch}
                        >
                            <Text fontSize="lg">Finalize Stitch</Text>
                        </Button>
                    </Box>
                    <Box className="stitchSection" color="white" minHeight="100vh" display="flex" flexDirection="column" alignItems="center" flex="1" mt="2em">
                        <Heading as='h3' size='xl'>Current Stitch</Heading>
                        <Box mt="1em" width="30em">
                            {currentStitchSongs.map((song) => (
                                <Song
                                    key={song.id}
                                    track={song}
                                    onPlay={handlePlay}
                                    location="currentStitch"
                                    onRemove={() => handleRemove(song.id)}
                                />
                            ))}
                        </Box>
                    </Box>
                </Box>
            </main>
        </div>
    )
}

export default Create;
