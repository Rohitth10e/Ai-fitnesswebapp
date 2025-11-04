// const handleNarration = async () => {
    //     if (isNarrating) {
    //         if (audioSourceRef.current) {
    //             try {
    //                 audioSourceRef.current.stop();
    //             } catch (e) {
    //                 console.warn("Audio stop error:", e.message);
    //             }
    //         }
    //         if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
    //             audioContextRef.current.close().catch(console.warn); 
    //         }
    //         setIsNarrating(false);
    //         toast.info('Narration stopped');
    //         return; // Exit function
    //     }

    //     // --- START NARRATION LOGIC ---
    //     setIsNarrating(true);
    //     toast.success('Starting narration...');

    //     try {
    //         const textToSpeak = generateNarrationText(plan);

    //         if (!textToSpeak) {
    //             throw new Error('Could not find plan text to narrate.');
    //         }

    //         // 1. Call your backend narration endpoint
    //         const response = await fetch('http://localhost:3000/apiv1/users/generate-narration', {
    //             method: 'POST',
    //             headers: { 'Content-Type': 'application/json' },
    //             body: JSON.stringify({ text: textToSpeak }),
    //         });

    //         if (!response.ok) {
    //             const errorData = await response.json();
    //             throw new Error(errorData.message || 'Failed to fetch audio');
    //         }

    //         // 2. Get the audio data as an ArrayBuffer
    //         const audioData = await response.arrayBuffer();

    //         // 3. Use Web Audio API to play it
    //         audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    //         const audioBuffer = await audioContextRef.current.decodeAudioData(audioData);

    //         audioSourceRef.current = audioContextRef.current.createBufferSource();
    //         audioSourceRef.current.buffer = audioBuffer;
    //         audioSourceRef.current.connect(audioContextRef.current.destination);
    //         audioSourceRef.current.start(0);
    //         toast.dismiss(); 
    //         toast.info("Narration playing...");

    //         // 4. Handle when the audio finishes playing
    //         audioSourceRef.current.onended = () => {
    //             setIsNarrating(false);
    //             toast.info('Narration completed');
    //             if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
    //                 audioContextRef.current.close().catch(console.warn);
    //             }
    //         };
    //     } catch (error) {
    //         console.error('Narration error:', error);
    //         setIsNarrating(false);
    //         toast.error(error.message || 'Failed to start narration.');
    //     }
    // };