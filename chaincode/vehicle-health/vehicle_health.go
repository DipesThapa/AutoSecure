package main

import (
    "encoding/json"
    "fmt"

    "github.com/hyperledger/fabric-contract-api-go/contractapi"
)

type SmartContract struct {
    contractapi.Contract
}

type VehicleRecord struct {
    VehicleID        string `json:"vehicleID"`
    EngineTemperature int    `json:"engineTemperature"`
    OilPressure       int    `json:"oilPressure"`
    TirePressure      struct {
        FrontLeft  int `json:"frontLeft"`
        FrontRight int `json:"frontRight"`
        RearLeft   int `json:"rearLeft"`
        RearRight  int `json:"rearRight"`
    } `json:"tirePressure"`
    BatteryStatus string `json:"batteryStatus"`
    FuelLevel     int    `json:"fuelLevel"`
}

type User struct {
    Username string `json:"username"`
    Password string `json:"password"`
}

func (s *SmartContract) InitLedger(ctx contractapi.TransactionContextInterface) error {
    users := []User{
        {Username: "user1", Password: "password1"},
        {Username: "user2", Password: "password2"},
    }

    for _, user := range users {
        userAsBytes, _ := json.Marshal(user)
        err := ctx.GetStub().PutState(user.Username, userAsBytes)
        if err != nil {
            return fmt.Errorf("failed to put user to world state. %s", err.Error())
        }
    }

    return nil
}

func (s *SmartContract) AuthenticateUser(ctx contractapi.TransactionContextInterface, username, password string) (bool, error) {
    userAsBytes, err := ctx.GetStub().GetState(username)
    if err != nil {
        return false, err
    }
    if userAsBytes == nil {
        return false, fmt.Errorf("user not found")
    }

    user := new(User)
    _ = json.Unmarshal(userAsBytes, user)
    if user.Password != password {
        return false, fmt.Errorf("incorrect password")
    }

    return true, nil
}

func (s *SmartContract) QueryVehicleData(ctx contractapi.TransactionContextInterface, vehicleID string) (*VehicleRecord, error) {
    vehicleAsBytes, err := ctx.GetStub().GetState(vehicleID)
    if err != nil {
        return nil, fmt.Errorf("failed to read from world state. %s", err.Error())
    }
    if vehicleAsBytes == nil {
        return nil, fmt.Errorf("%s does not exist", vehicleID)
    }

    vehicle := new(VehicleRecord)
    _ = json.Unmarshal(vehicleAsBytes, vehicle)

    return vehicle, nil
}

func main() {
    chaincode, err := contractapi.NewChaincode(new(SmartContract))
    if err != nil {
        fmt.Printf("Error create vehicle-health chaincode: %s", err.Error())
        return
    }

    if err := chaincode.Start(); err != nil {
        fmt.Printf("Error starting vehicle-health chaincode: %s", err.Error())
    }
}

