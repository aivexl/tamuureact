async function listModels() {
    const apiKey = 'AIzaSyAJPi2nk9hd1crhL7bitnPAq912JpBcsUQ';
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        console.log(JSON.stringify(data, null, 2));
    } catch (err) {
        console.error(err);
    }
}
listModels();
