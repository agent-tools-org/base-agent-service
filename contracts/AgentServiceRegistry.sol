// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title AgentServiceRegistry
 * @notice On-chain registry for agent services — discover, register, and manage
 *         services that agents provide on Base. Designed for the "Agent Services on Base" track.
 */
contract AgentServiceRegistry {
    struct Service {
        uint256 id;
        address agent;
        string name;
        string description;
        uint256 priceWei;
        string endpoint;
        bool active;
        uint256 timestamp;
    }

    uint256 public nextServiceId;
    mapping(uint256 => Service) public services;
    mapping(address => uint256[]) public agentServiceIds;
    uint256[] public activeServiceIds;

    // ---- Events ----
    event ServiceRegistered(
        uint256 indexed serviceId,
        address indexed agent,
        string name,
        uint256 priceWei,
        string endpoint
    );
    event ServiceUpdated(
        uint256 indexed serviceId,
        uint256 newPrice,
        string newEndpoint
    );
    event ServiceDeactivated(uint256 indexed serviceId);

    // ---- Modifiers ----
    modifier onlyServiceOwner(uint256 serviceId) {
        require(services[serviceId].agent == msg.sender, "Not service owner");
        _;
    }

    // ---- Write Functions ----

    /**
     * @notice Register a new service.
     * @param name        Human-readable service name.
     * @param description Short description of what the service does.
     * @param priceWei    Price per invocation in wei.
     * @param endpoint    Off-chain endpoint URL (or identifier) where the service can be reached.
     * @return serviceId  The newly assigned service ID.
     */
    function registerService(
        string calldata name,
        string calldata description,
        uint256 priceWei,
        string calldata endpoint
    ) external returns (uint256 serviceId) {
        serviceId = nextServiceId++;
        services[serviceId] = Service({
            id: serviceId,
            agent: msg.sender,
            name: name,
            description: description,
            priceWei: priceWei,
            endpoint: endpoint,
            active: true,
            timestamp: block.timestamp
        });
        agentServiceIds[msg.sender].push(serviceId);
        activeServiceIds.push(serviceId);

        emit ServiceRegistered(serviceId, msg.sender, name, priceWei, endpoint);
    }

    /**
     * @notice Update the price and endpoint of an existing service.
     */
    function updateService(
        uint256 serviceId,
        uint256 newPrice,
        string calldata newEndpoint
    ) external onlyServiceOwner(serviceId) {
        Service storage svc = services[serviceId];
        require(svc.active, "Service not active");
        svc.priceWei = newPrice;
        svc.endpoint = newEndpoint;

        emit ServiceUpdated(serviceId, newPrice, newEndpoint);
    }

    /**
     * @notice Deactivate a service so it no longer appears in discovery.
     */
    function deactivateService(uint256 serviceId) external onlyServiceOwner(serviceId) {
        Service storage svc = services[serviceId];
        require(svc.active, "Already inactive");
        svc.active = false;

        // Remove from activeServiceIds array
        for (uint256 i = 0; i < activeServiceIds.length; i++) {
            if (activeServiceIds[i] == serviceId) {
                activeServiceIds[i] = activeServiceIds[activeServiceIds.length - 1];
                activeServiceIds.pop();
                break;
            }
        }

        emit ServiceDeactivated(serviceId);
    }

    // ---- View Functions ----

    /**
     * @notice Get full details for a single service.
     */
    function getService(uint256 serviceId)
        external
        view
        returns (Service memory)
    {
        return services[serviceId];
    }

    /**
     * @notice List all service IDs registered by a given agent.
     */
    function getAgentServices(address agent)
        external
        view
        returns (uint256[] memory)
    {
        return agentServiceIds[agent];
    }

    /**
     * @notice Paginated discovery of active services.
     * @param offset Start index into the active-services list.
     * @param limit  Maximum number of services to return.
     */
    function discoverServices(uint256 offset, uint256 limit)
        external
        view
        returns (Service[] memory result)
    {
        uint256 total = activeServiceIds.length;
        if (offset >= total) {
            return new Service[](0);
        }
        uint256 end = offset + limit;
        if (end > total) {
            end = total;
        }
        uint256 count = end - offset;
        result = new Service[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = services[activeServiceIds[offset + i]];
        }
    }

    /**
     * @notice Total number of currently active services.
     */
    function activeServiceCount() external view returns (uint256) {
        return activeServiceIds.length;
    }
}
