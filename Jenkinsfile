pipeline {
    agent {
        docker {
                image 'node:16.13.1-alpine'
                args '-u root:root --tmpfs /.config'
              }
    }
    stages {
        stage('Install') {
            steps {
                sh 'pwd'
                sh 'npm install'
            }
        }
        stage('Build') {
            steps {
                sh 'npm run release'
            }
        }
    }
}
