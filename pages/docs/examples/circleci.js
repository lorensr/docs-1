import markdown from 'markdown-in-js'
import withDoc, { components } from '../../../lib/with-doc'
import { Code, InlineCode } from '../../../components/text/code'

// prettier-ignore
export default withDoc({
  title: 'Automate Node Deployment with Circle CI',
  description: 'Using Circle CI to automate your Now Node deployments',
  date: '26 May 2018',
  authors: [],
  editUrl: 'pages/docs/examples/circleci.js',
})(markdown(components)`

Every time you push or merge to the master branch a new build and deployment is initiated in Circle CI.

1. Create an account at [Circle CI](https://circleci.com/).
2. Create a ${<InlineCode>.circleci/config.yml</InlineCode>} file in your project with the following:

${
  <Code>{
  `# Javascript Node CircleCI 2.0 configuration file
#
# Check https://circleci.com/docs/2.0/language-javascript/ for more details
#
version: 2
jobs:
  build:
    docker:
      # specify the version you desire here
      - image: circleci/node:8.11

    working_directory: ~/repo

    steps:
      - checkout

      # Download and cache dependencies
      - restore_cache:
          keys:
            - v1-dependencies-{{ checksum "package.json" }}
            # fallback to using the latest cache if no exact match is found
            - v1-dependencies-

      - run: npm install

      - save_cache:
          paths:
            - node_modules
          key: v1-dependencies-{{ checksum "package.json" }}
        
      # run tests!
      - run: npm test

      - persist_to_workspace:
          root: ./
          paths: 
            - ./

  deploy:
    docker:
      - image: circleci/node:8.11
    working_directory: ~/repo
    steps:
      - attach_workspace:
          at: ~/repo
      - run:
          command: |
            npm run deploy
            npm run alias

workflows:
  version: 2
  build-and-deploy:
    jobs:
      - build
      - deploy:
          requires:
            - build
          filters:
            branches:
              only: master
  `}
  </Code>}


3. Open your ${<InlineCode>package.json</InlineCode>} file and add the following
information, adapted for your own deployment. This is used to run the alias command and point your
domain to the correct deployment (you could also put
this in a [now.json](https://zeit.co/blog/now-json) file):

${
<Code>{`{
    ...
    "now": {
        "name": "example",
        "alias": "example.com"
        }
    ...
}`}</Code>}

4. Also add the following 2 scripts to the ${<InlineCode>script</InlineCode>} property in your ${<InlineCode>package.json</InlineCode>} file. These are used by your Travis config. The first is to deploy and the second is used to alias your latest deploy:

${
<Code>{`{
    ...
    "scripts": {
    ...
        "deploy": "now -e NODE_ENV=production --token $NOW_TOKEN --npm",
        "alias": "now alias --token=$NOW_TOKEN"
        }
    }
}`}
</Code>
}

5. Make sure ${<InlineCode>now</InlineCode>} is a ${<InlineCode>devDependency</InlineCode>} with ${<InlineCode>npm install --save-dev now</InlineCode>}.

6. In your CircleCI account, go to "Add projects", then find your repository and click "Set Up Project". Then push your changes to master. The build should start and fail.

7. You need to get a [token](https://zeit.co/account/tokens). Go to the tokens page of your dashboard, under Account Settings, Tokens. Enter the name of the Token (e.g. Circle CI) and hit enter. A new token will be created which you can copy to your clipboard by clicking Copy.

8. In your CircleCI account, under Settings -> Projects, find your repo and click the gear icon on the right. Then select Environment Variables and add one called ${<InlineCode>NOW_TOKEN</InlineCode>} and paste in the value from the last step.

9. Test it out by pushing a change to master and checking your CircleCI build feed.
`)
