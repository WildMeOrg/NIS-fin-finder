### For local development 

* Current targets:  Node 18, Functions runtime version 2.0


* Install [Azure core tools](https://learn.microsoft.com/en-us/azure/azure-functions/functions-run-local?tabs=linux%2Cisolated-process%2Cnode-v4%2Cpython-v2%2Chttp-trigger%2Ccontainer-apps&pivots=programming-language-javascript#install-the-azure-functions-core-tools)

    E.g., for MacOS

    `brew tap azure/functions`

    `brew install azure-functions-core-tools@4`

    or Linux:

    `curl https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > microsoft.gpg`

    `sudo mv microsoft.gpg /etc/apt/trusted.gpg.d/microsoft.gpg`

* Install [Azurite](https://github.com/Azure/Azurite?tab=readme-ov-file#getting-started)

* Create [local.settings.json](https://learn.microsoft.com/en-us/azure/azure-functions/functions-develop-local?pivots=programming-language-javascript#local-settings-file)
Include FUNCTIONS_WORKER_RUNTIME and AzureWebJobsStorage and all of the settings from .env.sample in the Values section of local.setting.json, e.g. 
```aiignore
{
  "IsEncrypted": false,
  "Values": {
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",

    "MYSQL_HOST": "mysql.location.url",
    "MYSQL_USER": "whateveruser",
    "MYSQL_PASSWORD": "whateveruserspwd",
    "MYSQL_DATABASE": "myfinfinderdb",
    ... all the other variables ... 
    "TEMPLATE_ORG_REGISTRATION": "somestring"
  }
}
```
Note: "AzureWebJobsStorage" should be set to "UseDevelopmentStorage=true" so it uses Azurite. 

* Start Azurite in a console at the project root:

    `azurite`

* Start the functions at the project root:

    `npm start`

    or

    `func start --verbose`

    for more logging output.  
