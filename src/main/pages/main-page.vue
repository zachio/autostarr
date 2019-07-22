<template>
    <div class="container">
        <!-- Exploration -->
        <div class="row">
        <div class="mb-4 col-md-8" v-if="$root.screens.explore">      
            <div class="card">
            <div class="card-img-top" :style="{backgroundImage : 'url('+$root.jumbotron.image+')'}">
                <div class="alert" role="alert">
                <i class="fa fa-rocket mr-2" v-if="$root.spaceship.address[2] === $root.player.address[2]"></i> 
                <i class="fa fa-truck-pickup mr-2" v-for="i in $root.area.rovers"></i> 
                <i class="fa fa-truck-pickup" v-if="$root.player.rover"></i> 
                </div>
            </div> 
            <div class="card-body" v-if="!$root.isLoading">
                <div class="alert" :class="$root.alert.type" role="alert" v-if="$root.alert.message">
                <i class="fa" :class="$root.alert.icon"></i> {{$root.alert.message}}
                </div>
                <div class="progress mb-3">
                <div class="progress-bar progress-bar-striped progress-bar-animated" :class="$root.progressBar.type" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" :style="{width: $root.progressBar.percent +'%'}"></div>
                </div>
                <div class="row">
                <div class="col">
                    <h3 class="card-title">{{$root.jumbotron.title}}</h3>
                    <p class="card-text">{{$root.jumbotron.description}}</p>
                </div>
                <div class="col">
                    <div class="list-group mb-2" v-if="!$root.isLoading">
                    <button class="list-group-item list-group-item-action" v-on:click="scanArea()" v-if="!$root.player.ship && !$root.player.isMoving" :disabled="$root.isGameover || $root.busy"><i class="fas fa-search"></i>  Scan Area</button>
                    <button class="list-group-item list-group-item-action" @click="$root.enterSpaceship()" v-if="!$root.player.ship && $root.spaceship.address[2] === $root.player.address[2] && !$root.player.isMoving" :disabled="$root.player.isMoving || $root.player.isScanning || $root.isGameover || $root.busy || $root.player.rover"><i class="fas fa-door-open"></i> Board Spacecraft</button>
                    <button class="list-group-item list-group-item-action" @click="$root.craftFuel()" v-if="$root.player.ship" :disabled="$root.busy || $root.isGameover"><i class="fas fa-rocket"></i> Craft Fuel</button>
                    <button class="list-group-item list-group-item-action" @click="$root.craftRoverFuel()" v-if="$root.player.rover" :disabled="$root.busy || $root.isGameover"><i class="fas fa-truck-pickup"></i> Craft Fuel</button>
                    <button class="list-group-item list-group-item-action" @click="$root.craftAntiMatterFuel()" v-if="$root.player.address[1] == 0 && $root.player.isOrbiting" :disabled="$root.busy || $root.isGameover"><i class="fas fa-atom"></i> Craft Anti-matter Fuel</button>
                    <button class="list-group-item list-group-item-action" @click="$root.craftRover()" v-if="!$root.player.rover && !$root.player.ship &&  !$root.player.isMoving && $root.player.inventory.minerals >= 100" :disabled="$root.busy || $root.isGameover"><i class="fas fa-truck-pickup"></i> Craft Rover</button>
                    <button class="list-group-item list-group-item-action" :disabled="$root.busy || $root.isGameover" v-for="i in $root.area.rovers.length" @click="$root.enterRover(i)"><i class="fas fa-truck-pickup"></i> Enter Rover {{i}}</button>
                    <button class="list-group-item list-group-item-action" @click="$root.exitRover()" v-if="$root.player.rover && !$root.player.isMoving" :disabled="$root.busy || $root.isGameover"><i class="fas fa-truck-pickup"></i> Exit Rover</button>
                    <button class="list-group-item list-group-item-action" @click="$root.scan()" v-if="$root.player.isOrbiting && !$root.spaceship.isMoving" :disabled="$root.spaceship.isMoving || $root.player.isScanning || $root.isGameover"><i class="fas fa-search"></i> Scan for planets</button>
                    <button class="list-group-item list-group-item-action" @click="$root.travel(targetPlanet)" v-if="$root.player.isOrbiting && targetPlanet != currentOrbit" :disable="$root.spaceship.isMoving || $root.isGameover">
                        <i class="fas fa-rocket"></i> Travel <span class="badge badge-warning">{{Math.abs(($root.starsystem.astronomicalObjects[targetPlanet].starDistance - $root.player.starDistance)/1000).toFixed(1)}} <i class="fas fa-gas-pump"></i></span>
                    </button>
                    <button class="list-group-item list-group-item-action" @click="$root.travelToStar(-1)" v-if="$root.player.address[1] == 0 && !$root.spaceship.isMoving" :disable="$root.spaceship.isMoving || $root.isGameover">
                        <i class="fas fa-rocket"></i> Travel to {{$root.starNeighborName(-1)}}
                    </button>
                    <button class="list-group-item list-group-item-action" @click="$root.travelToStar(1)" v-if="$root.player.address[1] == 0 && !$root.spaceship.isMoving" :disable="$root.spaceship.isMoving || $root.isGameover">
                        <i class="fas fa-rocket"></i> Travel to {{$root.starNeighborName(1)}}
                    </button>
                    <button class="list-group-item list-group-item-action" @click="$root.exitSpaceship()" v-if="$root.player.ship && $root.spaceship.address[2] === $root.player.address[2] && $root.player.isLanded" :disabled="$root.player.isMoving || $root.player.isScanning || $root.isGameover || $root.player.rover"><i class="fas fa-door-open"></i> Exit Ship</button>
                    <button class="list-group-item list-group-item-action" @click="$root.launch()" v-if="$root.spaceship.address[2] === $root.player.address[2] && $root.player.ship && $root.player.isLanded" :disabled="$root.player.isMoving || $root.player.isScanning || $root.busy || $root.isGameover"><i class="fas fa-rocket"></i> Launch</button>
                    <button class="list-group-item list-group-item-action" @click="$root.land()" v-if="$root.player.isOrbiting && targetPlanet != 0 && targetPlanet == currentOrbit" :disabled="$root.isGameover"><i class="fas fa-rocket"></i> Land</button>
                    <button class="list-group-item list-group-item-action" v-on:click="exploreArea(-1)" :disabled="$root.player.isScanning || $root.player.isMoving || $root.isGameover" v-if="!$root.player.ship && !$root.player.isMoving"><i class="fas" :class="$root.exploreIcon"></i> Explore Left Area </button>
                    <button class="list-group-item list-group-item-action" @click="$root.exploreArea(1)" :disabled="$root.player.isMoving || $root.player.isScanning || $root.isGameover" v-if="!$root.player.ship && !$root.player.isMoving"><i class="fas" :class="$root.exploreIcon"></i> Explore Right Area</button>
                    <button class="list-group-item list-group-item-danger" @click="$root.hardReset()" v-if="$root.isGameover"><i class="fas fa-power-off"></i> Reset</button>
                    </div>
                </div>
                </div>
            </div>
            </div><!--/.card-->
        </div><!--/.col-->


        <!-- Controls -->
        <div class="col-md-4 mb-5">
            
            <!-- Inventory section -->
            <div class="card mb-3">
            <h5 class="card-header"><i class="fas fa-user-astronaut"></i> Player</h5>
            <div class="list-group list-group-flush">
                <li class="list-group-item">
                <h6 class="mb-1"><i class="fas fa-bolt"></i> Energy <span class="badge float-right">{{$root.player.energy.amount.toFixed()}}/{{$root.player.energy.max}}</span></h6>
                <div class="progress">
                    <div class="progress-bar bg-warning" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" :style="{width: ($root.player.energy.amount/$root.player.energy.max)*100 +'%'}"></div>
                </div>
                </li>
                <li class="list-group-item">
                <h6 class="mb-1"><i class="fas fa-box"></i> Storage <span class="badge float-right">{{$root.player.inventory.amount.toFixed()}}/{{$root.player.inventory.max}}</span></h6>
                <div class="progress">
                    <div class="progress-bar bg-primary" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" :style="{width: ($root.player.inventory.amount/$root.player.inventory.max)*100 +'%'}"></div>
                </div>
                </li>
                <li class="list-group-item" v-if="$root.player.inventory.carbon">
                <h6 class="mb-1"><i class="fas fa-tree"></i> Carbon 
                    <span class="badge float-right badge-success ml-2">{{$root.player.inventory.carbon.toFixed()}}</span>
                    <i class="fas fa-trash float-right ml-2" @click="$root.removeCarbon()" :disabled="$root.isGameover"></i>
                    <i class="fas fa-truck-pickup float-right ml-2" @click="$root.moveInventory('carbon','player','rover')" :disabled="$root.isGameover" v-if="$root.player.rover"></i>
                    <i class="fas fa-rocket float-right ml-2" @click="$root.moveInventory('carbon','player','spaceship')" :disabled="$root.isGameover" v-if="$root.player.ship"></i>
                </h6>
                </li>
                <li class="list-group-item" v-if="$root.player.inventory.minerals">
                <h6 class="mb-1"><i class="fas fa-mountain"></i> Minerals 
                    <span class="badge float-right badge-dark ml-2">{{$root.player.inventory.minerals.toFixed()}}</span>
                    <i class="fas fa-trash float-right ml-2"@click="$root.removeMinerals()" :disabled="$root.isGameover"></i>
                    <i class="fas fa-truck-pickup float-right ml-2" @click="$root.moveInventory('minerals','player','rover')" :disabled="$root.isGameover" v-if="$root.player.rover"></i>
                    <i class="fas fa-rocket float-right ml-2" @click="$root.moveInventory('minerals','player','spaceship')" :disabled="$root.isGameover" v-if="$root.player.ship"></i>
                </h6>
                </li>
            </div>
            </div>
            
            <div v-if="$root.player.rover" class="card mb-3">
            <h5 class="card-header"><i class="fas fa-truck-pickup"></i> Rover</h5>
            <div class="list-group list-group-flush">
                <li class="list-group-item">
                <h6 class="mb-1"><i class="fas fa-gas-pump"></i> Fuel <span class="badge float-right">{{rover.fuel.amount.toFixed()}}/{{rover.fuel.max}}</span></h6>
                <div class="progress">
                    <div class="progress-bar bg-danger" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" :style="{width: (rover.fuel.amount/rover.fuel.max)*100 +'%'}"></div>
                </div>
                </li>
                <li class="list-group-item">
                <h6 class="mb-1"><i class="fas fa-box"></i> Storage <span class="badge float-right">{{rover.inventory.amount.toFixed()}}/{{rover.inventory.max}}</span></h6>
                <div class="progress">
                    <div class="progress-bar bg-primary" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" :style="{width: (rover.inventory.amount/rover.inventory.max)*100 +'%'}"></div>
                </div>
                </li>
                <li class="list-group-item" v-if="rover.inventory.carbon">
                <h6 class="mb-1"><i class="fas fa-tree"></i> Carbon   
                    <span class="badge float-right badge-success ml-2">{{rover.inventory.carbon.toFixed()}}</span>
                    <i class="fas fa-trash float-right ml-2" @click="$root.removeCarbon()" :disabled="$root.isGameover"></i>
                    <i class="fas fa-user-astronaut float-right ml-2" @click="$root.moveInventory('carbon','rover','player')" :disabled="$root.isGameover"></i>
                </h6>
                </li>
                <li class="list-group-item" v-if="rover.inventory.minerals">
                <h6 class="mb-1">
                    <i class="fas fa-mountain"></i> Minerals 
                    <span class="badge float-right badge-dark ml-2">{{rover.inventory.minerals.toFixed()}}</span>
                    <i class="fas fa-trash float-right ml-2"@click="$root.removeMinerals()" :disabled="$root.isGameover"></i>
                    <i class="fas fa-user-astronaut float-right ml-2" @click="$root.moveInventory('minerals','rover','player')" :disabled="$root.isGameover"></i>
                </h6>
                </li>
            </div>
            </div>
            
            <div v-if="$root.player.ship" class="card mb-3">
            <h5 class="card-header"><i class="fas fa-rocket"></i> Spaceship</h5>
            <div class="list-group list-group-flush">
                <li class="list-group-item">
                <h6 class="mb-1"><i class="fas fa-gas-pump"></i> Fuel <span class="badge float-right">{{$root.spaceship.fuel.amount.toFixed()}}/{{$root.spaceship.fuel.max}}</span></h6>
                <div class="progress">
                    <div class="progress-bar bg-danger" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" :style="{width: ($root.spaceship.fuel.amount/$root.spaceship.fuel.max)*100 +'%'}"></div>
                </div>
                </li>
                <li class="list-group-item">
                <h6 class="mb-1"><i class="fas fa-gas-pump"></i> Anti-matter Fuel <span class="badge float-right">{{$root.spaceship.fuel.antimatter.amount.toFixed()}}/{{$root.spaceship.fuel.antimatter.max}}</span></h6>
                <div class="progress">
                    <div class="progress-bar bg-info" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" :style="{width: ($root.spaceship.fuel.antimatter.amount/$root.spaceship.fuel.antimatter.max)*100 +'%'}"></div>
                </div>
                </li>
                <li class="list-group-item">
                <h6 class="mb-1"><i class="fas fa-box"></i> Storage <span class="badge float-right">{{$root.spaceship.inventory.amount.toFixed()}}/{{$root.spaceship.inventory.max}}</span></h6>
                <div class="progress">
                    <div class="progress-bar bg-primary" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" :style="{width: ($root.spaceship.inventory.amount/$root.spaceship.inventory.max)*100 +'%'}"></div>
                </div>
                </li>
                <li class="list-group-item" v-if="$root.spaceship.inventory.carbon">
                <h6 class="mb-1"><i class="fas fa-tree"></i> Carbon 
                    <span class="badge float-right badge-success ml-2">{{$root.spaceship.inventory.carbon.toFixed()}}</span>
                    <i class="fas fa-trash float-right ml-2" @click="$root.removeCarbon()" :disabled="$root.isGameover"></i>
                    <i class="fas fa-user-astronaut float-right ml-2" @click="$root.moveInventory('carbon','spaceship','player')" :disabled="$root.isGameover"></i>
                </h6>
                </li>
                <li class="list-group-item" v-if="$root.spaceship.inventory.minerals">
                <h6 class="mb-1">
                    <i class="fas fa-mountain"></i> Minerals 
                    <span class="badge float-right badge-dark ml-2">{{$root.spaceship.inventory.minerals.toFixed()}}</span>
                    <i class="fas fa-trash float-right ml-2"@click="$root.removeMinerals()" :disabled="$root.isGameover"></i>
                    <i class="fas fa-user-astronaut float-right ml-2" @click="$root.moveInventory('minerals','spaceship','player')" :disabled="$root.isGameover"></i>
                </h6>
                </li>
            </div>
            </div>
            
            
            <div class="list-group" v-if="!$root.isLoading && $root.player.isOrbiting">
            <button @click="$root.selectAstroObject($root.astroObject.id)" class="list-group-item list-group-item-action" :class="[ $root.astroObject.id === currentOrbit ? 'active' : '']" v-if="$root.astroObject.scanned" v-for="astroObject in $root.starsystem.astronomicalObjects" role="button" type="button" style="cursor: pointer"><i class="fas" :class="$root.astroObject.icon"></i> <i class="fas fa-map-marker" v-if="$root.astroObject.id == currentOrbit"></i> {{$root.astroObject.name}} 
                <span class="badge badge-warning float-right">{{Math.abs(($root.astroObject.starDistance - $root.player.starDistance)/1000).toFixed(1)}} <i class="fas fa-gas-pump"></i></span>
            </button>
            </div>
            
            <div v-if="$root.area.scanned && !$root.player.ship" class="card mb-3">
            <h5 class="card-header">Natural Resources</h5>
            <div class="list-group list-group-flush">
                <button type="button" class="list-group-item list-group-item-success" v-if="$root.area.scanned && !$root.player.isMoving && !$root.player.ship" @click="$root.clickMineCarbon()" :disabled="$root.isGameover">
                    <h6 class="mb-0"><i class="fas fa-tree"></i> Mine Carbon {{$root.area.carbon.amount.toFixed()}} / {{$root.area.carbon.max}}</h6>
                    <div class="progress">
                    <div class="progress-bar progress-bar-striped bg-success" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" :style="{width: ($root.area.carbon.amount/$root.area.carbon.max)*100 +'%'}"></div>
                    </div>
                </button>
                <button type="button" class="list-group-item list-group-item-dark" v-if="$root.area.scanned && !$root.player.isMoving && !$root.player.ship" @click="$root.mineMinerals()" :disabled="$root.isGameover">
                    <h6 class="mb-0"><i class="fas fa-mountain"></i> Mine Minerals {{$root.area.minerals.amount.toFixed()}} / {{$root.area.minerals.max}}</h6>
                    <div class="progress">
                        <div class="progress-bar progress-bar-striped bg-dark" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" :style="{width: ($root.area.minerals.amount/$root.area.minerals.max)*100 +'%'}"></div>
                    </div>
                </button>
            </div>
            </div>
<!--        <div class="list-group">
            <button type="button" class="list-group-item list-group-item-action list-group-item-primary" @click="$root.save($root._data)">
                <h6 class="mb-0"><i class="fas fa-save"></i> Save</h6>
            </button>
            <button type="button" class="list-group-item list-group-item-action list-group-item-danger" @click="$root.hardReset()">
                <h6 class="mb-0"><i class="fas fa-power-off"></i> Reset</h6>
            </button>
            </div> -->
        </div>

        </div>
        <!-- /.row -->
        <!-- /.container -->
    </div>
</template>

<script>
    export default {
        name: "MainPage",
        components: {
        },
        data: function(){
            return {
            }
        }        
    };
</script>

<style></style>