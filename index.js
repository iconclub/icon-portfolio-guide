import { Octokit } from 'octokit'
import * as dotenv from 'dotenv'
import { v4 as uuidv4 } from 'uuid'

dotenv.config();

class ICONPortfolio {
    octokit = null
    user = null
    repository = null

    /**
     * This method must be called after initializing the ICONPortfolio class, when invoked will allow other methods the 
     * necessary information to call the GitHub API. For this method to work correctly, you need to have a fine-grained 
     * personal access token for GitHub API usage
     * API Documentation: https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token#creating-a-fine-grained-personal-access-token
     * @param {*} username - Required - The username to authenticate the user
     * @param {*} token - Optional - The token to authenticate the Octokit with
     */
    async authenticate(username, token = process.env.AUTH_TOKEN ) {
        if (!process.env.AUTH_TOKEN && !token) {
            console.log("Can't authenticate to Octokit with invalid token. Please recheck your token");
        }

        this.octokit = new Octokit({
            auth: token
        });

        await this.getUser(username);
    }

    /**
     * Private method - This method will be automatically invoked if call the authenticate() method
     * This method will get the user information from GitHub 
     * API Documentation:  https://docs.github.com/en/rest/users/users?apiVersion=2022-11-28#get-a-user
     * @param {*} username - the username for the detailed information
     */
    async getUser(username) {
        try {
            this.user = (await octokit.request(`GET /users/${username}`, {
                username 
            })).data;

            console.log(`${this.user.login} is authenticated`)
        } catch (error) {
            console.log(error.response?.data?.message ?? `Can't get username for user ${username}. Please try again.`)
        }
    }

    /**
     * This method will create a repository in the format "ICON Web Portfolio {UUIDv4}" if the argument name is not specified.
     * API Documentation: https://docs.github.com/en/rest/repos/repos?apiVersion=2022-11-28#create-a-repository-using-a-template
     * @param {*} name - Optional - the name of the repository that you will be creating
     */    
    async createRepository(name) {
        try {
            this.repository = (await octokit.request('POST /user/repos', {
                name: name ?? `ICON Web Portfolio ${uuidv4()}`,
            })).data;
    
            console.log(`${this.repository.name} was created`)
        } catch (error) {
            console.log(error.response?.data?.message ?? `Can't create a new repository. Please try again.`)
        }
    }

    /**
     * This method will get a repository that exists in your account
     * API Documentation: https://docs.github.com/en/rest/repos/repos?apiVersion=2022-11-28#get-a-repository
     * @param {*} name - Required - the name of the repository
     */    
     async getRepository(name) {
        try {
            const owner = this.user.login

            const response = (await octokit.request(`GET /repos/${owner}/${name}`, {
                owner,
                repo: name
            }))
    
            this.repository = response.data

            console.log(`Successfully get detail of ${this.repository.name}`);
        } catch (error) {
            console.log(error.response?.data?.message ?? `Can't get the detail of the repository ${name}`);
        }
     }

    /**
     * This method will be used to upload to the repository that you created before with the content to the filePath you specified.
     * Before calling this method you must call the authenticated() method and the createRepository() method
     * API Documentation: https://docs.github.com/en/rest/repos/contents?apiVersion=2022-11-28#create-or-update-file-contents
     * @param {*} filePath - the file that you want to upload to the repository. Example: index.html, style.css, ...
     * @param {*} content - the content of the file you want to upload
     */
    async uploadFileToRepository(filePath, content) {
        try {
            if (!this.user || !this.repository) {
                console.log('Please authenticate and create repository methods before uploading a file');
            }
    
            const owner = this.user.login
            const repository = this.repository.name
    
            const base64Content = this.convertToBase64(content)
            await octokit.request(`PUT /repos/${owner}/${repository}/contents/${filePath}`, {
                owner,
                repo: repository,
                path: filePath,
                message: `create a new ${filePath}`,
                content: base64Content
            })
    
            console.log(`${filePath} is uploaded successfully`)
        } catch (error) {
            console.log(error.response?.data?.message ?? `Can't upload ${filePath} to the repository ${repository}`);
        }
    }

    /**
     * Private method
     * @param {*} convertString - The string to convert to base64 
     * @returns 
     */
    convertToBase64(convertString) {
        return Buffer.from(convertString).toString('base64')
    }

    /**
     * This method will create a github page for the repository you just created
     * For the Github Pages to work correctly, you need to have a index.html file at root
     * API Documentation: https://docs.github.com/en/rest/pages?apiVersion=2022-11-28#create-a-github-pages-site
     */
    async createGithubPage() {
        try {
            const owner = this.user.login
            const repository = this.repository.name
    
            const { data: {
                url
            }} = await octokit.request(`POST /repos/${owner}/${repository}/pages`, {
                owner,
                repo: repository,
                source: {
                    branch: 'main',
                    path: '/'
                },
                build_type: "workflow"
            });
    
            console.log(`${url} is being created`);
        } catch (error) {
            console.log(error.response?.data?.message ?? `Can't create a Github Pages for the repository ${this.repository.name}`)
        }
    }
    
}

// Example call 
const icon = new ICONPortfolio();
await icon.authenticate('iconclub');
await icon.createRepository();
await icon.uploadFileToRepository('index.html', 
`
<!DOCTYPE html>
<html>
<head>
<title>Page Title</title>
</head>
<body>

<h1>My First Heading</h1>
<p>My first paragraph.</p>

</body>
</html>
`
)
await icon.createGithubPage();

// Optional
// await icon.getRepository('ICON-Web-Portfolio-af3a7951-dd00-4e8e-b143-efd0d7119750')