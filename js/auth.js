// window.stop()

authorize(window.location.pathname);

function manageAccess(resp, resource) {
    if (resource!=resp["role"]) {
        alert("Unauthorized Access");
        window.location.replace("/html/forbidden.html");
    }
}



async function authorize(pageUrl){
    const endpoint = "userCredentials";
    resource = pageUrl.split("/")[2]
    if (resource=="admin" || resource=="sm" || resource=="tco") {
        let data = await customFetch(endpoint, {credentials : "include"})
        console.log(data);
        manageAccess(data, resource);
    }
}