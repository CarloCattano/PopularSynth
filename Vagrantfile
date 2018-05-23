# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure("2") do |config|
  config.vm.box = "debian/stretch64"
  config.vm.network "forwarded_port", guest: 8080, host: 8080

  config.vm.provider "virtualbox" do |vb|
    vb.memory = "512"
    if RbConfig::CONFIG['host_os'] =~ /darwin/
      config.vm.network "private_network", type: "dhcp"
      config.vm.synced_folder ".", "/vagrant", type: "nfs"
    else
      config.vm.synced_folder ".", "/vagrant", type: "virtualbox"
    end
  end

  config.vm.provision "shell", inline: <<-SHELL
export APP_DB_USER=vagrant
export APP_DB_PASSWORD=vagrant
export APP_DB_NAME=vagrant

apt-get update
apt-get upgrade
apt-get install -y build-essential curl git vim

curl -sL https://deb.nodesource.com/setup_9.x | sudo -E bash -
apt-get update
apt-get install -y  nodejs

SHELL

end
