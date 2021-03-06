import * as Docker from 'dockerode';

export enum DockerEngineType {
    Linux,
    Windows
}

class DockerClient {
    private endPoint:Docker;

    constructor() {
        if (process.platform === 'win32') {
            this.endPoint = new Docker({ socketPath: "//./pipe/docker_engine" });
        } else {
            this.endPoint = new Docker({ socketPath: '/var/run/docker.sock' });
        }
    }

    public getContainerDescriptors(): Thenable<Docker.ContainerDesc[]>{
        return new Promise((resolve, reject) => {
            this.endPoint.listContainers((err, containers) => {
                if (err) {
                    return reject(err); 
                }
                return resolve(containers);
            });
        });
    };

    public getImageDescriptors(): Thenable<Docker.ImageDesc[]>{
        return new Promise((resolve, reject) => {
            this.endPoint.listImages((err, images) => {
                if (err) {
                    return reject(err); 
                }
                return resolve(images);
            });
        });
    };

    public getContainer(id: string): Docker.Container {
        return this.endPoint.getContainer(id);
    }

    public getEngineType() : Thenable<DockerEngineType> {
        if (process.platform === 'win32') {
            return new Promise((resolve, reject) => {
                this.endPoint.info((error, info) => {
                    if (error) {
                        return reject(error);
                    }

                    return resolve(info.OSType === "windows" ? DockerEngineType.Windows : DockerEngineType.Linux);
                });
            });
        };

        // On Linux or macOS, this can only ever be linux,
        // so short-circuit the Docker call entirely.
        return Promise.resolve(DockerEngineType.Linux);
    }

    public getImage(id:string): Docker.Image {
        return this.endPoint.getImage(id);
    }
}

export const docker = new DockerClient();