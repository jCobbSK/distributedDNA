YUI.add("yuidoc-meta", function(Y) {
   Y.YUIDoc = { meta: {
    "classes": [
        "ANL",
        "Client",
        "Cluster",
        "ClusterHandler",
        "DataTraffic",
        "Generator",
        "MasterRequest",
        "Node",
        "PingHandler",
        "Request",
        "RespondObject",
        "SampleReader",
        "Settings",
        "UsersStorage"
    ],
    "modules": [
        "Authentification",
        "Custom",
        "DNAAnalysis",
        "JDSM"
    ],
    "allModules": [
        {
            "displayName": "Authentification",
            "name": "Authentification",
            "description": "Custom middleware module for setting up authorization module and\nusername+password auth with additional roles"
        },
        {
            "displayName": "Custom",
            "name": "Custom",
            "description": "Static class with methods of creating fixture data."
        },
        {
            "displayName": "DNAAnalysis",
            "name": "DNAAnalysis",
            "description": "Cluster object used as elemental part of compute process. Patterns are clustered based on their's\nlocation on chromosome and sequenceStart and sequenceEnd are modified accordingly"
        },
        {
            "displayName": "JDSM",
            "name": "JDSM",
            "description": "Class Active Node List (ANL)"
        }
    ]
} };
});