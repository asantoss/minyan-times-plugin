pipeline {
    agent {
        dockerfile true
    }
    stages {
        stage('Install') {
            steps { 
                sh 'ls -al'
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
