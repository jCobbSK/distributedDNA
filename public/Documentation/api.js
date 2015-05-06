YUI.add("yuidoc-meta", function(Y) {
   Y.YUIDoc = { meta: {
    "classes": [
        "ANL",
        "Authentification",
        "Client",
        "Cluster",
        "ClusterHandler",
        "DataTraffic",
        "Generator",
        "MasterRequest",
        "Node",
        "PatternCrawler",
        "PingHandler",
        "Request",
        "RespondObject",
        "SampleReader",
        "Settings",
        "UsersStorage"
    ],
    "modules": [
        "Custom",
        "DNAAnalysis",
        "JDSM"
    ],
    "allModules": [
        {
            "displayName": "Custom",
            "name": "Custom",
            "description": "Custom middleware module for setting up authorization module and\nusername+password auth with method for generating authentification\nmiddleware for filtering based on defined roles (node, client, admin)."
        },
        {
            "displayName": "DNAAnalysis",
            "name": "DNAAnalysis",
            "description": "Client class executed on node's front-end. This class has to be browserifyied and include\ninto compute page. It automatically injects JDSM module's client class and therefore sockets.io-client\nscript too."
        },
        {
            "displayName": "JDSM",
            "name": "JDSM",
            "description": "Class Active Node List (ANL). It provides JDSM public API. It automatically handles\nconnection and disconnection of nodes and stores all actual connected nodes."
        }
    ]
} };
});