pipeline {
    agent {
        docker {
                image 'node:16.13.1-alpine'
                args '--tmpfs /.config'
              }
    }
    stages {
        stage('Install') {
            steps {
                sh 'npm install'
                sh 'npm install totalist/sync'

            }
        }
        stage('Build') {
            steps {
                sh 'npm run release'
            }
        }
    }
}
