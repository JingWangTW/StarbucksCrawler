# Line Bot Practice

A Starbucks activity crawler. Check for new activity every ten minutes. Once found a new announced activity, notify user by Line.

## How to install

* Step 1: Clone this repository.

* Step 2: Finsh config file.
    * Copy `configuration.example.json` as `configuration.json`.
    * Fill in each item.
        * `CHANNEL_ID`, `CHANNEL_SECRET`, `CHANNEL_ACCESS_TOKEN`: Thses should be gained in Line Developer Page.
        * `GOOGLE_FIRE_BASE_ADMIN`: This should be gained in firebase dashboard.

* Step 3: Install dependency package.

    `npm install`

## Run
`npm start`

